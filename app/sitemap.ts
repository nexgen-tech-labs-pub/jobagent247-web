import { MetadataRoute } from 'next'
import { CV_ROLES } from '@/lib/data/cv-roles'
import { COMPETITORS } from '@/lib/data/competitors'
import { LEARN_TOPICS } from '@/lib/data/learn-topics'

const BASE = 'https://jobagent247.co'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const cvRolePages: MetadataRoute.Sitemap = CV_ROLES.map(r => ({
    url: `${BASE}/cv-builder/${r.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const competitorPages: MetadataRoute.Sitemap = COMPETITORS.map(c => ({
    url: `${BASE}/vs/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const learnPages: MetadataRoute.Sitemap = LEARN_TOPICS.map(t => ({
    url: `${BASE}/learn/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [
    { url: `${BASE}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/in`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/in/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/in/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/cv-builder`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/vs`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/learn`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/data-compliance`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...cvRolePages,
    ...competitorPages,
    ...learnPages,
  ]
}
