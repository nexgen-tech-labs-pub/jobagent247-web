import * as Sentry from '@sentry/nextjs'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/cv-agent',
  '/job-matches',
  '/job-fit',
  '/career-intelligence',
  '/career-growth',
  '/evidence-builder',
  '/applications',
  '/applications/insights',
  '/follow-ups',
  '/interview-prep',
  '/settings',
  '/onboarding',
]

// Rate-limiter is a defence layer, not a hard dependency. If Upstash env vars
// are missing or malformed, the middleware fails open: the request is allowed
// through and we log once, instead of taking the whole site down with 500s.
let _ipRatelimit: Ratelimit | null = null
let _ipRatelimitInitTried = false
let _ipRatelimitRuntimeErrorReported = false
function getIpRatelimit(): Ratelimit | null {
  if (_ipRatelimit || _ipRatelimitInitTried) return _ipRatelimit
  _ipRatelimitInitTried = true
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token || !url.startsWith('https://')) {
    const reason = !url
      ? 'UPSTASH_REDIS_REST_URL not set'
      : !token
      ? 'UPSTASH_REDIS_REST_TOKEN not set'
      : 'UPSTASH_REDIS_REST_URL does not start with https://'
    console.warn(`[proxy] IP rate-limit disabled — ${reason}`)
    Sentry.captureMessage(`proxy: IP rate-limit disabled — ${reason}`, 'warning')
    return null
  }
  try {
    const redis = new Redis({ url, token })
    _ipRatelimit = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(60, '1 m'), prefix: 'ip' })
    return _ipRatelimit
  } catch (err) {
    console.warn('[proxy] IP rate-limit disabled — Redis init failed:', err)
    Sentry.captureException(err, {
      level: 'warning',
      tags: { component: 'proxy', subsystem: 'rate-limit' },
    })
    return null
  }
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const limiter = getIpRatelimit()
    if (limiter) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
      try {
        const { success } = await limiter.limit(ip)
        if (!success) {
          return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }
      } catch (err) {
        // Runtime Upstash failures (auth, network, quota) must not 500 the site —
        // rate-limiting is a defence layer, not a load-bearing dependency.
        // Disable the limiter for the rest of this process so subsequent requests
        // skip the failing call entirely instead of retrying every time.
        _ipRatelimit = null
        if (!_ipRatelimitRuntimeErrorReported) {
          _ipRatelimitRuntimeErrorReported = true
          console.warn('[proxy] IP rate-limit disabled at runtime:', err)
          Sentry.captureException(err, {
            level: 'warning',
            tags: { component: 'proxy', subsystem: 'rate-limit', stage: 'runtime' },
          })
        }
      }
    }
  }

  // Set locale cookie on first visit based on geo
  const existingLocale = request.cookies.get('locale')?.value
  type Locale = 'uk' | 'us' | 'eu' | 'au' | 'in'
  const EU_COUNTRIES = new Set([
    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
    'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
    'NO','IS','LI','CH', // EEA + Switzerland
  ])
  let detectedLocale: Locale = 'uk'
  if (!existingLocale) {
    const country = request.headers.get('x-vercel-ip-country') ?? ''
    if (country === 'GB') detectedLocale = 'uk'
    else if (country === 'US') detectedLocale = 'us'
    else if (country === 'AU' || country === 'NZ') detectedLocale = 'au'
    else if (country === 'IN') detectedLocale = 'in'
    else if (EU_COUNTRIES.has(country)) detectedLocale = 'eu'
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session on every request
  const { data: { user } } = await supabase.auth.getUser()

  // Apply locale cookie AFTER getUser so it goes on the final response
  if (!existingLocale) {
    response.cookies.set('locale', detectedLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
  }

  const path = request.nextUrl.pathname
  const isProtected = protectedRoutes.some(r => path.startsWith(r))

  // Unauthenticated → /login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // Authenticated on auth pages → /dashboard
  if (user && (path === '/login' || path === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Authenticated but onboarding not complete → /onboarding
  if (user && isProtected && path !== '/onboarding') {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    // Treat a missing profile row the same as onboarding_complete = false.
    // Defensive: the auth trigger should always create the row at signup,
    // but if it ever fails or is bypassed (e.g. user created via SQL), we
    // still want the user routed through onboarding rather than seeing an
    // empty dashboard.
    if (!profile || !profile.onboarding_complete) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const proxyConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
