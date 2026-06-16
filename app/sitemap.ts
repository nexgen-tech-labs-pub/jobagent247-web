import { MetadataRoute } from 'next'

const BASE = 'https://jobagent247.co'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/in`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/in/pricing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/data-compliance`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
