export type Locale = 'uk' | 'in'

// Domain values are written by the Cloud Run scraper; capitalised values
// are written by the Apify adapter via normaliseApifyJob().
// Both shapes must be present in the union for locale filtering to work
// regardless of which source produced the row.

export const UK_SOURCE_SITES = [
  // Cloud Run scraper output (literal domain)
  'jobserve.com',
  'adzuna.co.uk',
  'cv-library.co.uk',
  'cwjobs.co.uk',
  'reed.co.uk',
  'uk.indeed.com',
  // Apify adapter output (canonical board name)
  'LinkedIn',
  'Indeed',
] as const

export const INDIA_SOURCE_SITES = [
  // Cloud Run scraper output
  'naukri.com',
  'foundit.in',
  'jooble.org',
  'shine.com',
  'timesjobs.com',
  // Apify adapter output
  'Naukri',
  'Indeed India',
] as const

export function sitesForLocale(locale: Locale): readonly string[] {
  return locale === 'in' ? INDIA_SOURCE_SITES : UK_SOURCE_SITES
}

// Cloud Run scraper inputs — the actual domain lists handed to the scraping job.
export const UK_SCRAPER_SITES: readonly string[] = [
  'jobserve.com', 'adzuna.co.uk', 'cv-library.co.uk', 'cwjobs.co.uk', 'reed.co.uk', 'uk.indeed.com',
]
export const INDIA_SCRAPER_SITES: readonly string[] = [
  'naukri.com', 'foundit.in', 'jooble.org', 'shine.com', 'timesjobs.com',
]
