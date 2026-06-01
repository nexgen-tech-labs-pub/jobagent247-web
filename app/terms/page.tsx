/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { LegalLayout } from '@/components/layout/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms and Conditions — JobAgent247',
  description: 'Terms and conditions governing your use of the JobAgent247 platform, operated by Nexgen Tech Labs.',
}

const LAST_UPDATED = '28 May 2026'

export default function TermsPage() {
  return (
    <LegalLayout title="Terms and Conditions" lastUpdated={LAST_UPDATED}>

      <Section title="1. Introduction and Acceptance">
        <p>Welcome to JobAgent247. By accessing or using the JobAgent247 platform, website, or any associated services (collectively, the "Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not use the Service.</p>
        <p>These Terms form a legally binding agreement between you ("User", "you") and Nexgen Tech Labs ("we", "us", "our"), the company that builds and operates JobAgent247.</p>
      </Section>

      <Section title="2. About JobAgent247">
        <p>JobAgent247 is a software-as-a-service (SaaS) platform that provides AI-assisted tools to support job-search workflows, including CV improvement, job discovery, application support, cover letter generation, application tracking, and interview preparation. JobAgent247 is a software product built and managed by <strong>Nexgen Tech Labs</strong>, registered and operated from the <strong>United Kingdom</strong>.</p>
      </Section>

      <Section title="3. No Job Guarantee">
        <Disclaimer>
          JobAgent247 provides software tools and AI-assisted workflows to support job-search activity. We do not guarantee that using the platform will result in interviews, job offers, employment, recruiter responses, salary increases, visa sponsorship, or any specific career outcome. Hiring decisions are made solely by employers, recruiters, hiring managers, or other third parties entirely outside our control.
        </Disclaimer>
      </Section>

      <Section title="4. No Recruiter or Hiring Manager Relationship">
        <Disclaimer>
          JobAgent247 is not affiliated with, endorsed by, or formally connected to recruiters, hiring managers, employers, job boards, or staffing agencies unless explicitly stated in writing. We do not act on behalf of any employer, recruiter, hiring manager, or recruitment agency. JobAgent247 is not an employer, recruiter, recruitment agency, staffing agency, immigration adviser, legal adviser, or hiring representative.
        </Disclaimer>
      </Section>

      <Section title="5. Eligibility and User Responsibilities">
        <p>You must be at least 18 years of age to use the Service. By using the Service, you represent that you are eligible to enter into a binding agreement. You are responsible for:</p>
        <ul>
          <li>Providing accurate, truthful, and lawful information on your profile and in any content you upload or generate.</li>
          <li>Maintaining the confidentiality and security of your account credentials.</li>
          <li>All activity that occurs under your account.</li>
          <li>Reviewing all AI-generated content — including CVs, cover letters, recruiter messages, applications, and recommendations — before submitting or using it. You remain solely responsible for any content you submit to third parties.</li>
          <li>Complying with all applicable laws and third-party terms of service when using the platform.</li>
        </ul>
      </Section>

      <Section title="6. Acceptable and Prohibited Use">
        <p>You agree to use the Service only for lawful purposes. You must not:</p>
        <ul>
          <li>Misuse, abuse, or fraudulently use the platform or any outputs it generates.</li>
          <li>Submit false, misleading, or fabricated information to employers, recruiters, or third parties via the platform.</li>
          <li>Use the platform to spam, harass, impersonate, or engage in unlawful activity.</li>
          <li>Attempt to scrape, reverse-engineer, or extract content or data from the platform without authorisation.</li>
          <li>Upload malicious content, viruses, or code intended to harm systems or other users.</li>
          <li>Abuse AI generation features to produce content that violates applicable law or third-party rights.</li>
          <li>Create multiple accounts to circumvent usage limits or subscription restrictions.</li>
        </ul>
        <p>We reserve the right to suspend or terminate your access if we reasonably believe you have violated these Terms.</p>
      </Section>

      <Section title="7. AI-Assisted Outputs and User Responsibility">
        <p>JobAgent247 uses artificial intelligence to generate or enhance content such as CVs, cover letters, recruiter messages, job-match scores, interview questions, and profile suggestions. You acknowledge that:</p>
        <ul>
          <li>AI-generated outputs may contain errors, inaccuracies, or content that does not accurately reflect your skills, experience, or circumstances.</li>
          <li>You must review, verify, and approve all AI-generated content before using or submitting it.</li>
          <li>The platform does not provide career, legal, immigration, financial, tax, or employment advice.</li>
          <li>AI systems have inherent limitations and may occasionally produce unexpected or inappropriate outputs.</li>
        </ul>
      </Section>

      <Section title="8. Third-Party Platforms and Services">
        <p>The Service integrates with or links to third-party platforms including job boards, employer websites, payment processors, analytics tools, and AI model providers. We are not responsible for the content, policies, or practices of any third-party service. Your use of third-party services is subject to their own terms and privacy policies.</p>
      </Section>

      <Section title="9. Subscription, Billing, and Cancellation">
        <p>JobAgent247 offers free and paid subscription tiers. By subscribing to a paid plan, you authorise us to charge the applicable fees via our payment processor. Pricing, billing cycles, and feature entitlements are displayed on the pricing page and may be updated with reasonable notice.</p>
        <p>You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. We do not provide refunds for partially used billing periods except where required by applicable law. We reserve the right to modify pricing with reasonable advance notice to active subscribers.</p>
      </Section>

      <Section title="10. Intellectual Property">
        <p>All intellectual property in the JobAgent247 platform, including software, design, trademarks, logos, and brand elements, is owned by or licensed to Nexgen Tech Labs. You are granted a limited, non-exclusive, non-transferable licence to use the Service for its intended purpose during your active subscription.</p>
        <p>You retain ownership of any content you upload to the platform (such as your CV or profile information). By uploading content, you grant Nexgen Tech Labs a limited licence to process, store, and use that content solely to deliver the Service to you.</p>
      </Section>

      <Section title="11. Service Availability and Changes">
        <p>We aim to maintain high availability of the Service but do not guarantee uninterrupted access. The platform may be modified, updated, or have features added or removed at any time. We will endeavour to provide reasonable notice of material changes. Some features may be in beta and subject to change without notice.</p>
      </Section>

      <Section title="12. Limitation of Liability">
        <p>To the maximum extent permitted by applicable law, Nexgen Tech Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, including but not limited to loss of data, loss of income, loss of job opportunities, or other intangible losses.</p>
        <p>Our total liability for any claim arising under these Terms shall not exceed the total amount paid by you to Nexgen Tech Labs in the twelve months preceding the claim, or £100, whichever is greater.</p>
      </Section>

      <Section title="13. Indemnity">
        <p>You agree to indemnify and hold harmless Nexgen Tech Labs, its officers, employees, and agents from any claim, loss, damage, or expense (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your submission of false, misleading, or unlawful content.</p>
      </Section>

      <Section title="14. Termination and Suspension">
        <p>We may suspend or terminate your access to the Service at any time if we believe you have breached these Terms, engaged in misuse, or for any other reasonable operational reason. You may delete your account at any time via the settings page. Upon termination, your right to use the Service ceases immediately.</p>
      </Section>

      <Section title="15. Governing Law">
        <p>These Terms are governed by the laws of <strong>England and Wales</strong>. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales, unless applicable consumer law in your jurisdiction provides otherwise.</p>
      </Section>

      <Section title="16. Contact">
        <p>For questions about these Terms, please contact us at: <a href="mailto:media@jobsagent247.com" className="underline" style={{ color: '#8B5CF6' }}>media@jobsagent247.com</a></p>
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

function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl text-sm leading-relaxed font-medium" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--color-text-secondary)' }}>
      {children}
    </div>
  )
}
