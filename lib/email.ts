import { Resend } from 'resend'

let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY not set')
    _resend = new Resend(key)
  }
  return _resend
}

export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? 'Hitesh from JobAgent247 <hitesh@jobagent247.co>'
export const EMAIL_REPLY_TO = process.env.RESEND_REPLY_TO ?? 'hitesh@jobagent247.co'
