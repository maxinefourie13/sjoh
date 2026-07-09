import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader } from './brand.tsx'

const SITE_NAME = 'Sjoh'
const SITE_URL = 'https://sjoh.co.za'

const EarlyAccessProWaitlistEmail = () => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're on the Sjoh waitlist — founding spots are full but you're in</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />

        <Heading style={h1}>You're on the list, ous.</Heading>

        <Text style={lead}>
          Welkom. The first 500 Founding Pro spots got snapped up quick —
          but you're still on the early-access list, and you'll be one of
          the first to know when Sjoh goes live.
        </Text>

        <Section style={perksBox}>
          <Text style={perkLine}>
            <span style={tick}>✓</span> First-in-line for vetting & verification
          </Text>
          <Text style={perkLine}>
            <span style={tick}>✓</span> Heads-up before public launch
          </Text>
          <Text style={perkLine}>
            <span style={tick}>✓</span> No commission games — keep what you earn
          </Text>
        </Section>

        <Heading as="h2" style={h2}>What happens next?</Heading>
        <Text style={text}>
          We'll holla the moment Sjoh opens its doors. Sjoh is built for ous who
          do the graft properly — no middlemen, no commission, just clients
          finding the right person for the job.
        </Text>

        <Text style={signoff}>
          Sharp,<br />
          The {SITE_NAME} team
        </Text>

        <Text style={footer}>
          You're getting this because you signed up for early access at{' '}
          <a href={SITE_URL} style={link}>sjoh.co.za</a>.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EarlyAccessProWaitlistEmail,
  subject: "You're on the Sjoh list — founding spots full, but you're in",
  displayName: 'Early access — Pro (Waitlist, after 500)',
  previewData: {},
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const h1 = { fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f0f10', lineHeight: 1.15, margin: '0 0 16px' }
const h2 = { fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f0f10', margin: '28px 0 8px' }
const lead = { fontSize: '16px', color: '#3a3a3d', lineHeight: 1.55, margin: '0 0 24px' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.6, margin: '0 0 16px' }
const perksBox = { backgroundColor: '#fff5f4', border: '1px solid #fad5d1', borderRadius: '14px', padding: '18px 20px', margin: '8px 0 24px' }
const perkLine = { fontSize: '15px', color: '#0f0f10', fontWeight: 600, lineHeight: 1.5, margin: '6px 0' }
const tick = { color: '#e8665a', fontWeight: 800, marginRight: '8px' }
const signoff = { fontSize: '15px', color: '#0f0f10', lineHeight: 1.5, margin: '28px 0 24px' }
const footer = { fontSize: '12px', color: '#888888', lineHeight: 1.5, margin: '24px 0 0', borderTop: '1px solid #eeeeee', paddingTop: '16px' }
const link = { color: '#e8665a', textDecoration: 'underline' }
