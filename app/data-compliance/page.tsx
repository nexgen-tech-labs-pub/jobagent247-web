/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { LegalLayout } from '@/components/layout/LegalLayout'

export const metadata: Metadata = {
  title: 'Data Protection and Compliance — JobAgent247',
  description: 'Data protection and compliance information for users in the UK, EU/EEA, United States, and India.',
}

const LAST_UPDATED = '28 May 2026'

export default function DataCompliancePage() {
  return (
    <LegalLayout title="Data Protection and Compliance Notice" lastUpdated={LAST_UPDATED}>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        This notice explains how JobAgent247, operated by Nexgen Tech Labs (United Kingdom), approaches data protection obligations across the jurisdictions in which our users may be located. Compliance obligations vary based on user location, business thresholds, data flows, vendor relationships, and legal interpretation. <strong>This notice does not constitute legal advice and should be reviewed by qualified legal counsel before production launch or commercial operation.</strong>
      </p>

      <Section title="United Kingdom">
        <p>As a UK-registered company, Nexgen Tech Labs operates primarily under the following UK data protection framework:</p>
        <SubSection title="UK GDPR">
          <p>The UK General Data Protection Regulation (UK GDPR), retained in UK domestic law following the UK's departure from the European Union, sets out principles for lawful data processing, data subject rights, and controller obligations. We process personal data in accordance with UK GDPR requirements including lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, and integrity.</p>
        </SubSection>
        <SubSection title="Data Protection Act 2018">
          <p>The Data Protection Act 2018 supplements UK GDPR and governs areas including law enforcement processing and national security. Our processing activities are designed to comply with the Act's requirements where applicable.</p>
        </SubSection>
        <SubSection title="PECR (Privacy and Electronic Communications Regulations)">
          <p>Where we send electronic marketing communications or use non-essential cookies, we comply with PECR requirements, including obtaining appropriate consent where required.</p>
        </SubSection>
        <SubSection title="ICO">
          <p>The Information Commissioner's Office (ICO) is the UK's supervisory authority for data protection. UK users have the right to lodge a complaint with the ICO at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#8B5CF6' }}>ico.org.uk</a> if they believe their data has been processed unlawfully.</p>
        </SubSection>
      </Section>

      <Section title="European Union and EEA">
        <p>Where users are located in EU or EEA member states, the following considerations apply:</p>
        <SubSection title="EU GDPR">
          <p>The EU General Data Protection Regulation (Regulation 2016/679) may apply to our processing of EU residents' personal data, depending on the nature of our activities and any applicable establishment or targeting thresholds. We endeavour to apply EU GDPR-equivalent standards to EU user data.</p>
        </SubSection>
        <SubSection title="Data Subject Rights">
          <p>EU residents have rights including access, rectification, erasure, restriction, objection, portability, and the right to lodge a complaint with their national Data Protection Authority (DPA).</p>
        </SubSection>
        <SubSection title="International Transfers">
          <p>Transfers of EU personal data to countries outside the EEA that do not have an adequacy decision may require appropriate safeguards such as Standard Contractual Clauses (SCCs). We aim to ensure that any such transfers comply with applicable requirements. This is an area where legal review is particularly recommended.</p>
        </SubSection>
      </Section>

      <Section title="United States">
        <p>Where users are located in the United States, the following considerations apply:</p>
        <SubSection title="State Privacy Laws">
          <p>A number of US states have enacted consumer privacy laws (including California, Virginia, Colorado, Connecticut, and others) that may apply depending on the number of users we serve in those states and the nature of data processing. We do not sell personal information. Where applicable thresholds are met, we will provide required disclosures and honour applicable consumer rights requests.</p>
        </SubSection>
        <SubSection title="No Sale of Personal Information">
          <p>We do not sell personal information to third parties for advertising or other commercial purposes.</p>
        </SubSection>
        <SubSection title="Sensitive Data">
          <p>Career and employment-related data may be treated as sensitive under some state laws. We handle such data with appropriate care and limit its use to service delivery.</p>
        </SubSection>
        <SubSection title="Employment Law Disclaimer">
          <p>JobAgent247 is a software tool and is not an employer, recruiter, or hiring decision-maker. No US employment law obligations (such as EEO, ADA, or FLSA obligations) apply to Nexgen Tech Labs in respect of the users' job-search activities.</p>
        </SubSection>
        <SubSection title="Legal Review Recommended">
          <p>US privacy law is rapidly evolving. We recommend periodic legal review to assess compliance obligations as state laws develop.</p>
        </SubSection>
      </Section>

      <Section title="India">
        <p>Where users are located in India, the following considerations apply:</p>
        <SubSection title="Digital Personal Data Protection Act 2023 (DPDPA)">
          <p>India's Digital Personal Data Protection Act 2023 introduces requirements for lawful processing of digital personal data, consent management, and data principal rights. Where the DPDPA applies to our processing of Indian users' data, we aim to comply with its requirements including providing clear notice, obtaining consent where required, and responding to requests for access, correction, and deletion.</p>
        </SubSection>
        <SubSection title="Consent">
          <p>Where we rely on consent as a lawful basis under Indian law, we will ensure consent is freely given, specific, informed, and unambiguous. Users may withdraw consent at any time by contacting us.</p>
        </SubSection>
        <SubSection title="Grievance Officer">
          <p>For data-related complaints or requests from Indian users, please contact us at <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a>. We will endeavour to respond within a reasonable timeframe in accordance with applicable requirements.</p>
        </SubSection>
        <SubSection title="Legal Review Recommended">
          <p>The DPDPA and its implementing rules continue to develop. We recommend legal review to assess ongoing compliance obligations.</p>
        </SubSection>
      </Section>

      <Section title="General Compliance Matters">
        <SubSection title="Accuracy and Lawfulness of User Information">
          <p>Users are responsible for ensuring that any personal data they submit to the platform (including their own CV, contact details, and employment history) is accurate, up to date, and lawfully provided.</p>
        </SubSection>
        <SubSection title="Third-Party Links">
          <p>The platform may link to or integrate with third-party job boards, employer websites, and external services. We are not responsible for the data practices of those third parties and encourage users to review their respective privacy policies.</p>
        </SubSection>
        <SubSection title="Data Breach Notification">
          <p>In the event of a personal data breach that is likely to result in risk to affected individuals, we will take appropriate steps including notifying relevant supervisory authorities and affected users as required by applicable law.</p>
        </SubSection>
        <SubSection title="Security Disclosure">
          <p>If you discover a security vulnerability, please report it responsibly to <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a>.</p>
        </SubSection>
      </Section>

      <Section title="Contact for Compliance Queries">
        <p>For all data protection, privacy, and compliance queries — including requests to exercise your rights — please contact:</p>
        <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p className="font-semibold text-[color:var(--foreground)]">Nexgen Tech Labs</p>
          <p>Registered and operated in the United Kingdom</p>
          <p>Email: <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a></p>
        </div>
        <p>This notice reflects our current understanding of applicable obligations. It does not constitute legal advice and should be reviewed by a qualified legal professional before commercial launch or material changes to data processing activities.</p>
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
