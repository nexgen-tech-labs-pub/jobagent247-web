import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk'],
  typescript: {
    // tsc --noEmit runs as a dedicated CI job; skip the redundant check inside next build
    ignoreBuildErrors: process.env.CI === 'true',
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
})
