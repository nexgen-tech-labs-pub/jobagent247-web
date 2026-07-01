// Structured data for the marketing homepage. Organization schema lives in the
// root layout; this adds the page-level WebSite, SoftwareApplication, and FAQPage
// schemas that answer engines (ChatGPT, Perplexity, Claude, Gemini) extract directly.
//
// Keep the FAQ entries below in sync with the FAQSection list in app/(marketing)/page.tsx.

const FAQS: { question: string; answer: string }[] = [
  { question: 'Is this just a CV builder?', answer: 'No. It includes CV improvement, job matching, application generation, interview prep, LinkedIn optimisation, and application tracking — all powered by specialised AI agents.' },
  { question: 'Can it guarantee me a job?', answer: 'No platform can guarantee a job. The goal is to improve the quality, consistency, and speed of your job search — increasing your chances of getting interviews.' },
  { question: 'Can I tailor my CV for each job?', answer: 'Yes. The CV Agent analyses a job description and suggests role-specific CV improvements, targeting a 90+ ATS score for every application.' },
  { question: 'Does it work for tech roles?', answer: 'Yes — especially useful for cloud, DevOps, SRE, software, data, AI, and product roles. The platform understands technical terminology and ATS patterns for these fields.' },
  { question: 'Can I track my applications?', answer: 'Yes. Manage application stages, follow-up dates, interviews, recruiter contacts, and next actions — all in one pipeline view.' },
  { question: 'Is my data private?', answer: 'Your CVs, job documents, and profile data are handled securely. We do not share your personal data with employers or third parties without your consent.' },
]

const PLANS: { name: string; price: string; description: string }[] = [
  { name: 'Free', price: '0', description: 'For exploring and building your first profile' },
  { name: 'Pro', price: '9.99', description: 'For active job seekers who want better applications' },
  { name: 'Career Accelerator', price: '29.99', description: 'For serious job seekers and career switchers' },
]

export function HomeJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://jobagent247.co/#website',
        url: 'https://jobagent247.co',
        name: 'JobAgent247',
        publisher: { '@id': 'https://jobagent247.co/#organization' },
        inLanguage: 'en-GB',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://jobagent247.co/#software',
        name: 'JobAgent247',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://jobagent247.co',
        publisher: { '@id': 'https://jobagent247.co/#organization' },
        description:
          'AI job-search platform with 10+ specialised agents that score and rewrite CVs against any job description (targeting a 90+ ATS score), match live roles from 50+ UK job sites, draft tailored cover letters, and prepare you for interviews.',
        offers: PLANS.map((plan) => ({
          '@type': 'Offer',
          name: plan.name,
          price: plan.price,
          priceCurrency: 'GBP',
          description: plan.description,
          category: plan.price === '0' ? 'free' : 'subscription',
          url: 'https://jobagent247.co/pricing',
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://jobagent247.co/#faq',
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  }

  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(structuredData)}
    </script>
  )
}
