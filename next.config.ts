import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk'],
}

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
})
