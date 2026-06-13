export interface TokenResult {
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch ms
}

export interface ContainerValidationResult {
  exists: boolean
  containerId: string | null
  error: string | null
}

export interface ProviderMessage {
  providerMessageId: string
  providerThreadId: string
  sender: string
  subject: string
  receivedAt: string   // ISO 8601
  bodyText: string
  snippet: string
}

export interface ProviderMessagePage {
  messages: ProviderMessage[]
  nextCursor: string | null
}

export interface EmailProviderAdapter {
  provider: 'gmail' | 'microsoft'
  requiredContainerName: string
  getAuthorizationUrl(state: string): string
  exchangeAuthorizationCode(code: string): Promise<TokenResult>
  refreshAccessToken(refreshToken: string): Promise<TokenResult>
  getAccountEmail(accessToken: string): Promise<string>
  getAccountId(accessToken: string): Promise<string>
  validateContainer(accessToken: string): Promise<ContainerValidationResult>
  listMessages(accessToken: string, cursor: string | null, maxResults?: number): Promise<ProviderMessagePage>
}
