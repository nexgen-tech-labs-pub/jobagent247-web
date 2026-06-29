/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { LegalLayout } from '@/components/layout/LegalLayout'

export const metadata: Metadata = {
  title: 'Editorial and Corrections Policy — JobAgent247',
  description:
    'How JobAgent247 sources, reviews, and corrects the information on this site, and how to report an inaccuracy.',
}

const LAST_UPDATED = '29 June 2026'

export default function EditorialPolicyPage() {
  return (
    <LegalLayout title="Editorial and Corrections Policy" lastUpdated={LAST_UPDATED}>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        JobAgent247, operated by Nexgen Tech Labs (United Kingdom), publishes product information,
        guidance, and career resources for job seekers. This policy explains how we research, review,
        and correct that content so readers — and the answer engines that cite us — can rely on it.
      </p>

      <Section title="Who is responsible">
        <p>
          All content on this site is produced and reviewed by the JobAgent247 team at Nexgen Tech Labs.
          Product capabilities, pricing, and limits described on this site reflect the live product at the
          date shown on each page. Questions about accuracy can be sent to{' '}
          <a href="mailto:media@jobagent247.co" className="underline" style={{ color: '#8B5CF6' }}>media@jobagent247.co</a>.
        </p>
      </Section>

      <Section title="How we source claims">
        <SubSection title="Product claims">
          <p>
            Statements about what the platform does — for example, that it runs 10+ specialised agents,
            covers 50+ UK and Indian job sites, or targets a 90+ ATS score — describe the product's
            design and intended behaviour, not a guaranteed outcome for any individual user.
          </p>
        </SubSection>
        <SubSection title="Outcome language">
          <p>
            We never promise guaranteed employment. We describe the platform in terms of improving the
            quality, consistency, and speed of a job search and increasing the chance of interviews. Any
            figures we publish describe platform capability, not promised results.
          </p>
        </SubSection>
        <SubSection title="Third-party references">
          <p>
            Where we reference external standards, tools, or data, we link to the primary source so readers
            can verify it directly.
          </p>
        </SubSection>
      </Section>

      <Section title="Review and updates">
        <p>
          Each published page carries a "last updated" date. When the product changes, we update the
          affected pages and revise that date. Material changes to pricing or core capabilities are
          reflected on this site promptly.
        </p>
      </Section>

      <Section title="Corrections">
        <p>
          If you find an error or an out-of-date claim on this site, email{' '}
          <a href="mailto:media@jobagent247.co" className="underline" style={{ color: '#8B5CF6' }}>media@jobagent247.co</a>{' '}
          with the page and the issue. We review correction requests and update verified inaccuracies,
          refreshing the page's "last updated" date when we do.
        </p>
      </Section>

      <Section title="AI and answer engines">
        <p>
          We allow reputable AI search and answer engines to access our public content (see our{' '}
          <a href="/robots.txt" className="underline" style={{ color: '#8B5CF6' }}>robots.txt</a>) so that
          accurate, up-to-date information about JobAgent247 can be surfaced and cited. The authoritative
          version of any claim is always the live page on this site at its stated "last updated" date.
        </p>
      </Section>

    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading font-semibold text-xl text-[color:var(--foreground)]">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pl-4 border-l-2 space-y-1" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
      <p className="font-semibold text-[color:var(--foreground)]">{title}</p>
      <div>{children}</div>
    </div>
  )
}
