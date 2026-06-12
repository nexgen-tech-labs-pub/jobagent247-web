import type { Job, ProfileSkills } from './types/database'

export function scoreJobRelevance(job: Job, skills: ProfileSkills): number {
  if (!job.description && !job.title) return 0
  const searchable = `${job.title ?? ''} ${job.description ?? ''} ${job.requirements ?? ''} ${job.responsibilities ?? ''}`.toLowerCase()

  const skillMatches = skills.topSkills.filter(s => searchable.includes(s.toLowerCase())).length
  const skillScore = skills.topSkills.length > 0
    ? (skillMatches / skills.topSkills.length) * 70
    : 0

  const domainMatches = skills.preferredDomains.filter(d => searchable.includes(d.toLowerCase())).length
  const domainScore = skills.preferredDomains.length > 0
    ? (domainMatches / skills.preferredDomains.length) * 20
    : 0

  const levelKeywords: Record<ProfileSkills['experienceLevel'], string[]> = {
    junior:    ['junior', 'graduate', 'entry'],
    mid:       ['mid', 'intermediate', '3 year', '4 year'],
    senior:    ['senior', 'lead', '5 year', '6 year', '7 year'],
    staff:     ['staff', 'principal', 'architect'],
    principal: ['principal', 'distinguished', 'fellow'],
  }
  const levelMatch = levelKeywords[skills.experienceLevel].some(kw => searchable.includes(kw)) ? 10 : 0

  return Math.min(100, Math.round(skillScore + domainScore + levelMatch))
}

export function sortJobsByRelevance<T extends Job>(jobs: T[], skills: ProfileSkills): T[] {
  return [...jobs].sort((a, b) => scoreJobRelevance(b, skills) - scoreJobRelevance(a, skills))
}
