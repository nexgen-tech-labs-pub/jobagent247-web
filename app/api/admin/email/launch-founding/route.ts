import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { render } from '@react-email/render'
import { createAdminClient } from '@/lib/supabase'
import { getResend, EMAIL_FROM, EMAIL_REPLY_TO } from '@/lib/email'
import { FoundingMemberLaunch } from '@/lib/emails/FoundingMemberLaunch'

const logger = console
const CAMPAIGN = 'founding-member-launch-v1'

interface Recipient {
  id: string
  email: string | null
  name: string | null
}

// GET — preview the rendered HTML, no send. Auth still required.
//   /api/admin/email/launch-founding?preview=1&name=Hitesh
export async function GET(req: NextRequest) {
  if (!authorise(req)) return unauthorised()
  const url = new URL(req.url)
  const name = url.searchParams.get('name')
  const html = await render(FoundingMemberLaunch({ firstName: name }))
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

// POST — send the campaign. Idempotent: users with a row in email_sends for
// this campaign are skipped automatically.
//
// Query params:
//   ?dryRun=1       — log who would be sent to, don't actually send
//   ?to=<email>     — send only to this email (must be a founding member); ignores idempotency
//   ?limit=<n>      — cap the send batch (useful for staged rollouts)
export async function POST(req: NextRequest) {
  if (!authorise(req)) return unauthorised()

  const url = new URL(req.url)
  const dryRun = url.searchParams.get('dryRun') === '1'
  const targetEmail = url.searchParams.get('to')?.toLowerCase() ?? null
  const limit = Math.max(1, Math.min(500, parseInt(url.searchParams.get('limit') ?? '500', 10) || 500))

  const admin = createAdminClient()

  // Build the recipient list
  let query = admin
    .from('users')
    .select('id, email, name')
    .eq('founding_member', true)
    .not('email', 'is', null)

  if (targetEmail) query = query.eq('email', targetEmail)

  const { data: candidates, error: qErr } = await query
  if (qErr) {
    Sentry.captureException(qErr)
    return NextResponse.json({ error: qErr.message }, { status: 500 })
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, errors: 0, message: 'No matching recipients' })
  }

  // Find users who already received this campaign so we can skip them
  // (skipped only when no explicit ?to= override).
  const candidateIds = candidates.map((c) => c.id)
  const { data: alreadySent } = await admin
    .from('email_sends')
    .select('user_id')
    .eq('campaign', CAMPAIGN)
    .in('user_id', candidateIds)
  const sentIds = new Set((alreadySent ?? []).map((r) => r.user_id))

  const toSend: Recipient[] = candidates
    .filter((c) => targetEmail || !sentIds.has(c.id))
    .slice(0, limit) as Recipient[]

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      wouldSend: toSend.length,
      alreadySent: sentIds.size,
      recipients: toSend.map((r) => ({ id: r.id, email: r.email, name: r.name })),
    })
  }

  const resend = getResend()
  let sent = 0
  let errors = 0
  const failures: Array<{ id: string; email: string | null; error: string }> = []

  for (const r of toSend) {
    if (!r.email) {
      errors++
      failures.push({ id: r.id, email: null, error: 'no email on record' })
      continue
    }
    const firstName = r.name?.split(' ')[0] ?? null
    const html = await render(FoundingMemberLaunch({ firstName }))

    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: r.email,
        replyTo: EMAIL_REPLY_TO,
        subject: "You're one of our first 100. Here's what that means.",
        html,
      })
      if (error) throw new Error(error.message ?? 'resend error')

      // Mark as sent only AFTER Resend accepted. If the insert fails, log it
      // but don't roll back the send — better to risk a re-send than lose the
      // send record entirely. Targeted ?to= overrides reset the row.
      if (targetEmail) {
        await admin
          .from('email_sends')
          .upsert({ user_id: r.id, campaign: CAMPAIGN, resend_id: data?.id ?? null, sent_at: new Date().toISOString() }, { onConflict: 'user_id,campaign' })
      } else {
        await admin
          .from('email_sends')
          .insert({ user_id: r.id, campaign: CAMPAIGN, resend_id: data?.id ?? null })
      }
      sent++
    } catch (err) {
      errors++
      const msg = err instanceof Error ? err.message : String(err)
      failures.push({ id: r.id, email: r.email, error: msg })
      Sentry.captureException(err, { tags: { campaign: CAMPAIGN }, extra: { userId: r.id } })
      logger.error('[launch-founding] send failed:', r.email, msg)
    }
  }

  return NextResponse.json({
    ok: true,
    campaign: CAMPAIGN,
    sent,
    skipped: sentIds.size,
    errors,
    failures: failures.length > 0 ? failures : undefined,
    remaining: candidates.length - sentIds.size - toSend.length,
  })
}

function authorise(req: NextRequest): boolean {
  const header = req.headers.get('authorization')
  const expected = process.env.ADMIN_API_TOKEN
  return !!expected && header === `Bearer ${expected}`
}

function unauthorised() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
