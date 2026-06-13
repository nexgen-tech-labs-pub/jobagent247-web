import type { EmailProviderAdapter, TokenResult, ContainerValidationResult, ProviderMessagePage, ProviderMessage } from './types'

const AUTHORITY = 'https://login.microsoftonline.com/common'
const GRAPH = 'https://graph.microsoft.com/v1.0'
const FOLDER_NAME = 'job247'
const SCOPES = ['Mail.Read', 'offline_access']

function redirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/email/auth/microsoft/callback`
}

async function graphGet(accessToken: string, path: string): Promise<unknown> {
  const res = await fetch(`${GRAPH}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Graph ${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export const microsoftAdapter: EmailProviderAdapter = {
  provider: 'microsoft',
  requiredContainerName: FOLDER_NAME,

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id:     process.env.MICROSOFT_OAUTH_CLIENT_ID!,
      response_type: 'code',
      redirect_uri:  redirectUri(),
      scope:         SCOPES.join(' '),
      state,
      response_mode: 'query',
    })
    return `${AUTHORITY}/oauth2/v2.0/authorize?${params.toString()}`
  },

  async exchangeAuthorizationCode(code: string): Promise<TokenResult> {
    const body = new URLSearchParams({
      client_id:     process.env.MICROSOFT_OAUTH_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET!,
      code,
      redirect_uri:  redirectUri(),
      grant_type:    'authorization_code',
      scope:         SCOPES.join(' '),
    })
    const res = await fetch(`${AUTHORITY}/oauth2/v2.0/token`, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + data.expires_in * 1000 }
  },

  async refreshAccessToken(refreshToken: string): Promise<TokenResult> {
    const body = new URLSearchParams({
      client_id:     process.env.MICROSOFT_OAUTH_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
      scope:         SCOPES.join(' '),
    })
    const res = await fetch(`${AUTHORITY}/oauth2/v2.0/token`, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
    return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, expiresAt: Date.now() + data.expires_in * 1000 }
  },

  async getAccountEmail(accessToken: string): Promise<string> {
    const data = await graphGet(accessToken, '/me?$select=mail,userPrincipalName') as { mail?: string; userPrincipalName?: string }
    return data.mail ?? data.userPrincipalName ?? ''
  },

  async getAccountId(accessToken: string): Promise<string> {
    const data = await graphGet(accessToken, '/me?$select=id') as { id: string }
    return data.id
  },

  async validateContainer(accessToken: string): Promise<ContainerValidationResult> {
    try {
      const data = await graphGet(accessToken, `/me/mailFolders?$filter=displayName eq '${FOLDER_NAME}'&$select=id,displayName`) as { value: { id: string }[] }
      const folder = data.value[0]
      if (!folder) return { exists: false, containerId: null, error: `Folder "${FOLDER_NAME}" not found in mailbox` }
      return { exists: true, containerId: folder.id, error: null }
    } catch (err) {
      return { exists: false, containerId: null, error: String(err) }
    }
  },

  async listMessages(accessToken: string, cursor: string | null, maxResults = 50): Promise<ProviderMessagePage> {
    const params = new URLSearchParams({
      '$select': 'id,conversationId,from,subject,receivedDateTime,bodyPreview,body',
      '$top': String(maxResults),
      '$orderby': 'receivedDateTime desc',
    })
    if (cursor) params.set('$skiptoken', cursor)

    const folderRes = await graphGet(accessToken, `/me/mailFolders?$filter=displayName eq '${FOLDER_NAME}'&$select=id`) as { value: { id: string }[] }
    const folderId = folderRes.value[0]?.id
    if (!folderId) return { messages: [], nextCursor: null }

    const data = await graphGet(accessToken, `/me/mailFolders/${folderId}/messages?${params.toString()}`) as {
      value: {
        id: string; conversationId: string
        from: { emailAddress: { address: string } }
        subject: string; receivedDateTime: string; bodyPreview: string
        body: { contentType: string; content: string }
      }[]
      '@odata.nextLink'?: string
    }

    const nextLinkUrl = data['@odata.nextLink']
    const nextCursor = nextLinkUrl ? new URL(nextLinkUrl).searchParams.get('$skiptoken') : null

    const messages: ProviderMessage[] = data.value.map(m => ({
      providerMessageId: m.id,
      providerThreadId:  m.conversationId,
      sender:            m.from.emailAddress.address,
      subject:           m.subject ?? '',
      receivedAt:        m.receivedDateTime,
      bodyText:          (m.body.contentType === 'html' ? stripHtml(m.body.content) : m.body.content).slice(0, 4000),
      snippet:           m.bodyPreview,
    }))

    return { messages, nextCursor }
  },
}
