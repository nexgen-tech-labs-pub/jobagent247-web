import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://jobagent247.com'),
  title: 'JobAgent247 — AI Job Search Tool India | Resume Builder & Interview Prep',
  description: 'India\'s AI job search platform. Build a stronger resume, match jobs on Naukri and LinkedIn, generate cover letters, and prepare for interviews.',
  keywords: [
    'AI job search tool India',
    'AI resume builder India',
    'job application tool India',
    'interview preparation tool India',
    'Naukri alternative',
    'job match score India',
    'cover letter generator India',
  ],
  openGraph: {
    title: 'JobAgent247 — AI Job Search Tool India',
    description: 'Build stronger resumes, match jobs, and prepare for interviews with AI agents.',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: '/og-image-in.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://jobagent247.com/in',
    languages: {
      'en-GB': 'https://jobagent247.com',
      'en-IN': 'https://jobagent247.com/in',
    },
  },
}

export default function InMarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
