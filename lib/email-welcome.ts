import * as Sentry from '@sentry/nextjs'
import { render } from '@react-email/render'
import { createAdminClient } from '@/lib/supabase'
import { getResend, EMAIL_FROM, EMAIL_REPLY_TO } from '@/lib/email'
import { Welcome } from '@/emails/Welcome'

const CAMPAIGN = 'welcome-v1'

/**
 * Send the welcome email exactly once per user. Safe to call on every
 * sign-in event — the email_sends table guarantees one send per user per
 * campaign, so repeated callers become no-ops after the first success.
 *
 * Errors are logged + reported to Sentry but never thrown. The welcome
 * email is non-critical; failing to send must never block auth flow.
 */
export async function sendWelcomeIfFirstTime(userId: string): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('email_sends')
      .select('user_id')
      .eq('user_id', userId)
      .eq('campaign', CAMPAIGN)
      .maybeSingle()

    if (existing) return

    const { data: user } = await admin
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .maybeSingle()

    if (!user?.email) return

    const firstName = user.name?.split(' ')[0] ?? null
    const html = await render(Welcome({ firstName }))

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      replyTo: EMAIL_REPLY_TO,
      subject: 'Welcome to JobAgent247 — three steps to your first tailored CV',
      html,
    })
    if (error) throw new Error(error.message ?? 'resend error')

    await admin
      .from('email_sends')
      .insert({
        user_id: userId,
        campaign: CAMPAIGN,
        resend_id: data?.id ?? null,
      })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { campaign: CAMPAIGN, component: 'welcome-email' },
      extra: { userId },
    })
    console.error('[email-welcome] send failed for', userId, err)
  }
}
