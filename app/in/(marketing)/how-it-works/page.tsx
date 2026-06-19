import type { Metadata } from 'next'
import { HowItWorksPage } from '@/components/marketing/HowItWorksPage'
import { HOW_IT_WORKS_IN } from '@/lib/data/how-it-works'

export const metadata: Metadata = {
  metadataBase: new URL('https://jobagent247.co'),
  title: HOW_IT_WORKS_IN.metaTitle,
  description: HOW_IT_WORKS_IN.metaDescription,
  alternates: {
    canonical: HOW_IT_WORKS_IN.canonical,
    languages: {
      'en-GB': 'https://jobagent247.co/how-it-works',
      'en-IN': 'https://jobagent247.co/in/how-it-works',
    },
  },
  openGraph: {
    title: HOW_IT_WORKS_IN.metaTitle,
    description: HOW_IT_WORKS_IN.metaDescription,
    url: HOW_IT_WORKS_IN.canonical,
    siteName: 'JobAgent247',
    type: 'article',
  },
}

export default function Page() {
  return <HowItWorksPage copy={HOW_IT_WORKS_IN} />
}
