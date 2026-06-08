import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://jobagent247.com', changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://jobagent247.com/pricing', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://jobagent247.com/in', changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://jobagent247.com/in/pricing', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://jobagent247.com/terms', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://jobagent247.com/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://jobagent247.com/data-compliance', changeFrequency: 'yearly', priority: 0.3 },
  ]
}
