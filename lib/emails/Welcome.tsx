import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface Props {
  firstName?: string | null
  appUrl?: string
}

const APP_URL_DEFAULT = 'https://jobagent247.co'

export function Welcome({ firstName, appUrl = APP_URL_DEFAULT }: Props) {
  const greeting = firstName ? `Hi ${firstName},` : 'Welcome,'

  return (
    <Html>
      <Head />
      <Preview>Get your first tailored CV in 10 minutes.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={paragraph}>{greeting}</Text>

            <Text style={paragraph}>
              Welcome to JobAgent247. You&apos;ve got 10 AI agents that work together to help you
              land more interviews — CV scoring, tailored cover letters, live job matching, interview prep,
              and follow-up tracking.
            </Text>

            <Text style={paragraph}>
              <strong>Three steps to get your first tailored CV in ~10 minutes:</strong>
            </Text>

            <Text style={listItem}>
              1.{' '}
              <Link href={`${appUrl}/onboarding`} style={link}>
                Complete your profile
              </Link>{' '}
              — target roles, location, salary. Takes 2 minutes.
            </Text>
            <Text style={listItem}>
              2.{' '}
              <Link href={`${appUrl}/cv-agent`} style={link}>
                Upload your CV
              </Link>{' '}
              and paste any job description.
            </Text>
            <Text style={listItem}>
              3. Click <strong>Run CV Agent</strong>. You&apos;ll get an ATS score, missing keywords, and
              a one-click rewrite targeting 90+.
            </Text>

            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Link href={`${appUrl}/onboarding`} style={button}>
                Get started
              </Link>
            </Section>

            <Text style={paragraph}>
              <strong>Founding-member offer:</strong> the first 100 users get 30 days of Pro free —
              unlimited CV rewrites, job matching, and cover letters. Complete onboarding to claim your spot
              while it&apos;s still open.
            </Text>

            <Text style={paragraph}>
              If anything&apos;s confusing or missing, just reply to this email — I read every message.
            </Text>

            <Text style={paragraph}>Cheers,</Text>
            <Text style={signature}>Hitesh<br />Founder, JobAgent247</Text>

            <Hr style={hr} />

            <Text style={footer}>
              JobAgent247 · You&apos;re receiving this because you signed up at{' '}
              <Link href={appUrl} style={footerLink}>
                jobagent247.co
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default Welcome

const body = { backgroundColor: '#f6f7f9', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px', backgroundColor: '#ffffff', borderRadius: '12px' }
const paragraph = { fontSize: '15px', lineHeight: '24px', color: '#111827', margin: '0 0 16px' }
const listItem = { fontSize: '15px', lineHeight: '24px', color: '#111827', margin: '0 0 8px', paddingLeft: '4px' }
const link = { color: '#7c3aed', textDecoration: 'underline' }
const button = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 600,
  display: 'inline-block',
}
const signature = { fontSize: '15px', lineHeight: '22px', color: '#111827', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '32px 0 16px' }
const footer = { fontSize: '12px', lineHeight: '18px', color: '#6b7280', margin: 0 }
const footerLink = { color: '#6b7280', textDecoration: 'underline' }
