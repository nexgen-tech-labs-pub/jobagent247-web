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

export function FoundingMemberLaunch({ firstName, appUrl = APP_URL_DEFAULT }: Props) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'

  return (
    <Html>
      <Head />
      <Preview>You&apos;re one of our first 100. Here&apos;s what that means.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={paragraph}>{greeting}</Text>

            <Text style={paragraph}>
              I&apos;m Hitesh — I built JobAgent247. You&apos;re one of fewer than 100 people
              who get founding-member access, which means:
            </Text>

            <Text style={listItem}>• 30 days of Pro free, no card required</Text>
            <Text style={listItem}>• Unlimited CV rewrites, job matching, and cover letters during the trial</Text>
            <Text style={listItem}>
              • Direct line to me. If something&apos;s broken or missing, hit reply — I read every message.
            </Text>

            <Text style={paragraph}>
              <strong>Three things that&apos;ll take you 10 minutes:</strong>
            </Text>

            <Text style={listItem}>
              1.{' '}
              <Link href={`${appUrl}/cv-agent`} style={link}>
                Upload your CV
              </Link>{' '}
              — you&apos;ll be able to score it against any job description.
            </Text>
            <Text style={listItem}>
              2.{' '}
              <Link href={`${appUrl}/profile`} style={link}>
                Add your target roles
              </Link>{' '}
              in your profile.
            </Text>
            <Text style={listItem}>
              3. Try one tailored CV rewrite for a real job posting you&apos;re interested in.
            </Text>

            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Link href={`${appUrl}/cv-agent`} style={button}>
                Open CV Agent
              </Link>
            </Section>

            <Text style={paragraph}>
              After your 30 days, you can keep Pro at £9.99/mo or drop back to Free — no
              charge today, no auto-charge tomorrow. I&apos;ll send a reminder a few days
              before the trial ends.
            </Text>

            <Text style={paragraph}>
              If you&apos;ve got 15 minutes next week, I&apos;d love to hear how you&apos;re using it.
              Reply to this email and I&apos;ll send a Calendly link.
            </Text>

            <Text style={paragraph}>Cheers,</Text>
            <Text style={signature}>Hitesh<br />Founder, JobAgent247</Text>

            <Hr style={hr} />

            <Text style={footer}>
              JobAgent247 · You&apos;re receiving this because you signed up as a founding
              member at{' '}
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

export default FoundingMemberLaunch

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
