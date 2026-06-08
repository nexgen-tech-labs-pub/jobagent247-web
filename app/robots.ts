import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/onboarding', '/profile', '/cv-agent', '/job-matches', '/applications', '/interview-prep', '/settings'],
      },
    ],
    sitemap: 'https://jobagent247.com/sitemap.xml',
  }
}
