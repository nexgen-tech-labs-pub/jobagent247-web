/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { LegalLayout } from '@/components/layout/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — JobAgent247',
  description: 'How JobAgent247 collects, uses, and protects your personal data.',
}

const LAST_UPDATED = '28 May 2026'

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>

      <Section title="1. Who We Are">
        <p>JobAgent247 is operated by <strong>Nexgen Tech Labs</strong>, registered and based in the <strong>United Kingdom</strong>. We are the data controller for personal data processed through the JobAgent247 platform.</p>
        <p>Contact for all data, privacy, and compliance queries: <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a></p>
      </Section>

      <Section title="2. What Personal Data We Collect">
        <p>We may collect the following categories of personal data when you use the Service:</p>
        <SubSection title="Account Data">
          <p>Name, email address, login identifiers, authentication metadata, and account preferences.</p>
        </SubSection>
        <SubSection title="Career Data">
          <p>CV/resume content, work history, education, skills, certifications, portfolio links, GitHub or LinkedIn-style profile URLs, target roles, salary expectations (if provided), location preferences, and job-search notes.</p>
        </SubSection>
        <SubSection title="Application Data">
          <p>Saved jobs, application history, cover letters, recruiter messages, AI-generated content, interview preparation notes, and application status tracking information.</p>
        </SubSection>
        <SubSection title="Usage Data">
          <p>Device and browser information, IP address, log data, page activity, feature usage patterns, and error logs.</p>
        </SubSection>
        <SubSection title="Payment Data">
          <p>If you subscribe to a paid plan, payment is handled by a third-party payment processor. We do not store full card details. We may receive billing-related metadata such as subscription status and payment confirmation.</p>
        </SubSection>
        <SubSection title="Support and Communication Data">
          <p>Emails, feedback, complaint information, and support request content.</p>
        </SubSection>
        <SubSection title="AI Processing">
          <p>Content you provide to the platform (such as your CV or job descriptions) may be processed by AI or language model providers to generate or improve outputs. This processing is governed by those providers' data processing agreements and our data sharing practices described below.</p>
        </SubSection>
      </Section>

      <Section title="3. Why We Use Your Data">
        <p>We use personal data to:</p>
        <ul>
          <li>Create and manage your account and provide the Service.</li>
          <li>Generate AI-assisted outputs such as CV improvements, cover letters, and job match scores.</li>
          <li>Support your job-search workflow and maintain your application tracker.</li>
          <li>Ensure platform security, detect fraud, and prevent misuse.</li>
          <li>Analyse usage patterns to improve the platform.</li>
          <li>Process subscription payments and manage billing.</li>
          <li>Respond to support requests and complaints.</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>
      </Section>

      <Section title="4. Legal Bases for Processing">
        <p>Where UK GDPR or EU GDPR applies, we process your personal data on the following legal bases:</p>
        <ul>
          <li><strong>Contract:</strong> Processing necessary to provide the Service you have signed up for.</li>
          <li><strong>Legitimate Interests:</strong> Security, fraud prevention, analytics, and platform improvement, where these do not override your rights.</li>
          <li><strong>Consent:</strong> Marketing communications and non-essential cookies, where we request your consent.</li>
          <li><strong>Legal Obligation:</strong> Compliance with applicable laws, tax, and regulatory requirements.</li>
        </ul>
      </Section>

      <Section title="5. Data Sharing with Third Parties">
        <p>We may share data with the following categories of third parties:</p>
        <ul>
          <li><strong>Hosting and infrastructure providers</strong> (e.g. cloud platforms) for service delivery.</li>
          <li><strong>AI and language model providers</strong> for generating CV improvements, cover letters, and other content.</li>
          <li><strong>Payment processors</strong> for billing and subscription management.</li>
          <li><strong>Analytics tools</strong> for understanding platform usage (configured to minimise personal data exposure where possible).</li>
          <li><strong>Customer support tools</strong> for managing support requests.</li>
          <li><strong>Security and fraud prevention services.</strong></li>
          <li><strong>Legal and regulatory authorities</strong> where we are required to disclose information by law.</li>
        </ul>
        <p>We do not sell your personal data to third parties.</p>
      </Section>

      <Section title="6. International Data Transfers">
        <p>Your data may be processed outside the United Kingdom or European Economic Area by our third-party service providers (for example, cloud or AI providers based in the United States). Where such transfers occur, we take steps to ensure appropriate safeguards are in place, such as standard contractual clauses or equivalent mechanisms recognised under applicable law.</p>
      </Section>

      <Section title="7. Data Retention">
        <p>We retain your personal data for as long as your account is active or as needed to provide the Service. We also retain data as necessary to comply with legal obligations, resolve disputes, prevent fraud, and maintain operational records. You may request deletion of your account and associated data at any time, subject to any lawful exceptions.</p>
      </Section>

      <Section title="8. Your Rights">
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data, subject to lawful exceptions.</li>
          <li><strong>Restriction:</strong> Request that we restrict processing of your data in certain circumstances.</li>
          <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
          <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format.</li>
          <li><strong>Withdrawal of consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
          <li><strong>Complaint:</strong> Lodge a complaint with the relevant supervisory authority (in the UK: the Information Commissioner's Office at ico.org.uk).</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a>.</p>
      </Section>

      <Section title="9. Cookies and Tracking">
        <p>We use essential cookies to maintain sessions and enable core platform functionality. We may use analytics cookies to understand how the platform is used. Where non-essential cookies are used, we will request your consent. You can manage cookie preferences in your browser settings.</p>
      </Section>

      <Section title="10. Security">
        <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. No system is completely secure, and we cannot guarantee absolute security. If you become aware of a security vulnerability, please report it responsibly to <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a>.</p>
      </Section>

      <Section title="11. Children's Privacy">
        <p>JobAgent247 is not intended for use by persons under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will take steps to delete it.</p>
      </Section>

      <Section title="12. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the platform. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="13. Contact">
        <p>For any privacy, data, or compliance queries, contact us at: <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a></p>
      </Section>

    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading font-semibold text-xl text-[color:var(--foreground)]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pl-4 border-l-2" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
      <p className="font-semibold text-[color:var(--foreground)] mb-1">{title}</p>
      {children}
    </div>
  )
}
