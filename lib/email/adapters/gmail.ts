import { google } from 'googleapis'
import type { EmailProviderAdapter, TokenResult, ContainerValidationResult, ProviderMessagePage, ProviderMessage } from './types'

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
const LABEL_NAME = 'jobagent247'

function makeClient(accessToken?: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/email/auth/gmail/callback`,
  )
  if (accessToken) auth.setCredentials({ access_token: accessToken })
  return auth
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractBodyText(payload: { body?: { data?: string }; parts?: { mimeType?: string; body?: { data?: string } }[] } | undefined): string {
  if (!payload) return ''
  if (payload.body?.data) return Buffer.from(payload.body.data, 'base64url').toString('utf8')
  const textPart = payload.parts?.find(p => p.mimeType === 'text/plain')
  if (textPart?.body?.data) return Buffer.from(textPart.body.data, 'base64url').toString('utf8')
  const htmlPart = payload.parts?.find(p => p.mimeType === 'text/html')
  if (htmlPart?.body?.data) return stripHtml(Buffer.from(htmlPart.body.data, 'base64url').toString('utf8'))
  return ''
}

export const gmailAdapter: EmailProviderAdapter = {
  provider: 'gmail',
  requiredContainerName: LABEL_NAME,

  getAuthorizationUrl(state: string): string {
    return makeClient().generateAuthUrl({ access_type: 'offline', scope: SCOPES, state, prompt: 'consent' })
  },

  async exchangeAuthorizationCode(code: string): Promise<TokenResult> {
    const auth = makeClient()
    const { tokens } = await auth.getToken(code)
    return {
      accessToken:  tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt:    tokens.expiry_date ?? Date.now() + 3600_000,
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<TokenResult> {
    const auth = makeClient()
    auth.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await auth.refreshAccessToken()
    return {
      accessToken:  credentials.access_token!,
      refreshToken: credentials.refresh_token ?? refreshToken,
      expiresAt:    credentials.expiry_date ?? Date.now() + 3600_000,
    }
  },

  async getAccountEmail(accessToken: string): Promise<string> {
    const auth = makeClient(accessToken)
    const gmail = google.gmail({ version: 'v1', auth })
    const profile = await gmail.users.getProfile({ userId: 'me' })
    return profile.data.emailAddress ?? ''
  },

  async getAccountId(accessToken: string): Promise<string> {
    return this.getAccountEmail(accessToken)
  },

  async validateContainer(accessToken: string): Promise<ContainerValidationResult> {
    try {
      const auth = makeClient(accessToken)
      const gmail = google.gmail({ version: 'v1', auth })
      const res = await gmail.users.labels.list({ userId: 'me' })
      const label = res.data.labels?.find(l => l.name?.toLowerCase() === LABEL_NAME.toLowerCase())
      if (!label) return { exists: false, containerId: null, error: `Label "${LABEL_NAME}" not found in Gmail` }
      return { exists: true, containerId: label.id!, error: null }
    } catch (err) {
      return { exists: false, containerId: null, error: String(err) }
    }
  },

  async listMessages(accessToken: string, cursor: string | null, maxResults = 50): Promise<ProviderMessagePage> {
    const auth = makeClient(accessToken)
    const gmail = google.gmail({ version: 'v1', auth })

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [LABEL_NAME],
      maxResults,
      pageToken: cursor ?? undefined,
    })

    const items = listRes.data.messages ?? []
    const messages: ProviderMessage[] = []

    for (const item of items) {
      if (!item.id) continue
      const msg = await gmail.users.messages.get({ userId: 'me', id: item.id, format: 'full' })
      const headers = msg.data.payload?.headers ?? []
      const get = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''
      messages.push({
        providerMessageId: item.id,
        providerThreadId:  msg.data.threadId ?? item.id,
        sender:            get('from'),
        subject:           get('subject'),
        receivedAt:        new Date(parseInt(msg.data.internalDate ?? '0', 10)).toISOString(),
        bodyText:          extractBodyText(msg.data.payload as Parameters<typeof extractBodyText>[0]).slice(0, 4000),
        snippet:           msg.data.snippet ?? '',
      })
    }

    return { messages, nextCursor: listRes.data.nextPageToken ?? null }
  },
}
