import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://jobagent247.com'),
  title: 'JobAgent247 — AI Job Search Tool UK | CV Builder & Interview Prep',
  description: 'UK\'s AI job search platform. Build a stronger CV, match roles on LinkedIn and Indeed, generate tailored cover letters, and prepare for interviews.',
  keywords: [
    'AI job search tool UK',
    'AI CV builder UK',
    'job application tool UK',
    'interview preparation tool UK',
    'cover letter generator UK',
    'job match score UK',
    'AI career tools UK',
  ],
  openGraph: {
    title: 'JobAgent247 — AI Job Search Tool UK',
    description: 'Get more interviews with your AI job search agents.',
    type: 'website',
    locale: 'en_GB',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://jobagent247.com',
    languages: {
      'en-GB': 'https://jobagent247.com',
      'en-IN': 'https://jobagent247.com/in',
    },
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
