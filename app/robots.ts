import { MetadataRoute } from 'next'

const PRIVATE_AREAS = [
  '/dashboard',
  '/api/',
  '/onboarding',
  '/profile',
  '/cv-agent',
  '/job-matches',
  '/applications',
  '/interview-prep',
  '/settings',
  '/follow-ups',
  '/career-growth',
  '/career-intel',
  '/evidence-builder',
  '/job-fit',
]

// AI search/answer bots — explicitly allow them so any future tightening of the
// `*` rule never silently de-lists us from AI citations.
const AI_SEARCH_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_AREAS },
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_AREAS,
      })),
    ],
    sitemap: 'https://jobagent247.co/sitemap.xml',
  }
}
