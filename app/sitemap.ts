import { MetadataRoute } from 'next'
import { CV_ROLES } from '@/lib/data/cv-roles'
import { COMPETITORS } from '@/lib/data/competitors'
import { LEARN_TOPICS } from '@/lib/data/learn-topics'

const BASE = 'https://jobagent247.co'

export default function sitemap(): MetadataRoute.Sitemap {
  const cvRolePages: MetadataRoute.Sitemap = CV_ROLES.map(r => ({
    url: `${BASE}/cv-builder/${r.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const competitorPages: MetadataRoute.Sitemap = COMPETITORS.map(c => ({
    url: `${BASE}/vs/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const learnPages: MetadataRoute.Sitemap = LEARN_TOPICS.map(t => ({
    url: `${BASE}/learn/${t.slug}`,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [
    { url: `${BASE}`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/in`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/in/pricing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/how-it-works`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/in/how-it-works`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/cv-builder`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/vs`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/learn`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/data-compliance`, changeFrequency: 'yearly', priority: 0.3 },
    ...cvRolePages,
    ...competitorPages,
    ...learnPages,
  ]
}
