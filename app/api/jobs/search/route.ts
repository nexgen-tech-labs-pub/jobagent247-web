import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { createServerClient } from '@/lib/supabase'
import { extractProfileSkills } from '@/lib/claude'
import { sortJobsByRelevance } from '@/lib/profile-matching'
import { sitesForLocale } from '@/lib/job-sources/sites'
import type { Job } from '@/lib/types/database'

const logger = console  // swap for Sentry logger in Phase 5

let _redis: Redis | null = null
function getRedis() {
  if (!_redis) _redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  return _redis
}

const CACHE_TTL = 900

type UserJobRow = { id: string; match_score: number | null; status: string | null }

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const keywords = sp.get('keywords') ?? ''
  const location  = sp.get('location') ?? ''
  const type      = sp.get('type') ?? ''
  const visa      = sp.get('visa') === 'true'
  const minScore  = parseInt(sp.get('min_score') ?? '0', 10)
  const page      = Math.max(1, parseInt(sp.get('page') ?? '1', 10))
  const limit     = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '20', 10)))
  const offset    = (page - 1) * limit

  const idsParam = sp.get('ids')
  if (idsParam) {
    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5)
    if (ids.length === 0) return NextResponse.json({ error: 'ids parameter is empty' }, { status: 400 })
    const { data, error } = await supabase
      .from('jobs')
      .select('*, user_jobs!left(id, match_score, status)')
      .in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const jobs = (data ?? []).map(j => {
      const userJobs = Array.isArray(j.user_jobs) ? j.user_jobs as UserJobRow[] : []
      const uj = userJobs[0] ?? null
      return { ...j, user_jobs: undefined, match_score: uj?.match_score ?? null, saved_status: uj?.status ?? null, user_job_id: uj?.id ?? null }
    })
    return NextResponse.json({ jobs, total: jobs.length, page: 1 })
  }

  // Resolve user locale once so search results stay scoped to UK or India
  // boards. Without this, an Indian user querying without an explicit
  // location string sees every UK row that matches their keywords.
  const { data: profileRow } = await supabase
    .from('users')
    .select('locale')
    .eq('id', user.id)
    .maybeSingle()
  const locale = (profileRow?.locale === 'in' ? 'in' : 'uk') as 'uk' | 'in'
  const allowedSites = sitesForLocale(locale)

  const cacheKey = `jobs:search:${user.id}:${locale}:${keywords}:${location}:${type}:${visa}:${minScore}:${page}:${limit}`
  try {
    const cached = await getRedis().get(cacheKey)
    if (cached) return NextResponse.json(cached)
  } catch (redisErr) {
    logger.error('[jobs/search] Redis get failed:', redisErr)
  }

  let query = supabase
    .from('jobs')
    .select('*, user_jobs!left(id, match_score, status)', { count: 'exact' })
    .in('source_site', allowedSites as unknown as string[])
    .range(offset, offset + limit - 1)
    .order('posted_date', { ascending: false, nullsFirst: false })
    .order('scraped_at', { ascending: false })

  if (keywords) query = query.or(`title.ilike.%${keywords}%,description.ilike.%${keywords}%`)
  if (location) query = query.ilike('location', `%${location}%`)
  if (type)     query = query.eq('type', type)
  if (visa)     query = query.eq('visa_sponsorship', true)

  const { data, error, count } = await query
  if (error) {
    logger.error('[jobs/search] Supabase query error:', error.code, error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let jobs = (data ?? []).map(j => {
    const userJobs = Array.isArray(j.user_jobs) ? j.user_jobs as UserJobRow[] : []
    const uj = userJobs[0] ?? null
    return {
      ...j,
      user_jobs: undefined,
      match_score: uj?.match_score ?? null,
      saved_status: uj?.status ?? null,
      user_job_id: uj?.id ?? null,
    }
  }).filter(j => minScore === 0 || (j.match_score ?? 0) >= minScore)

  try {
    const { data: cv } = await supabase
      .from('cvs')
      .select('raw_text')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    if (cv?.raw_text) {
      const skills = await extractProfileSkills(cv.raw_text)
      const unscored = jobs.filter(j => j.match_score === null)
      const scored   = jobs.filter(j => j.match_score !== null)
      const rankedUnscored = sortJobsByRelevance(unscored as unknown as Job[], skills)
        .map(j => unscored.find(u => u.id === j.id)!)
      jobs = [...scored.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)), ...rankedUnscored]
    }
  } catch {
    // Degrade gracefully — profile ranking is non-critical
  }

  const result = { jobs, total: count ?? 0, page }
  try {
    await getRedis().setex(cacheKey, CACHE_TTL, result)
  } catch (redisErr) {
    logger.error('[jobs/search] Redis setex failed:', redisErr)
  }
  return NextResponse.json(result)
}
