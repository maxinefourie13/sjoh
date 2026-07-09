import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader } from './brand.tsx'

const SITE_NAME = 'Sjoh'
const SITE_URL = 'https://sjoh.co.za'

interface Props {
  jobTitle?: string
  proName?: string
  reviewUrl?: string
}

const VerifiedReviewChaserEmail = ({
  jobTitle = 'your job',
  proName = 'your pro',
  reviewUrl = SITE_URL,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>How did {proName} do? Drop a quick Verified Review.</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />

        <Heading style={h1}>Job done — how did it go?</Heading>

        <Text style={lead}>
          <strong>{proName}</strong> has marked your job
          {' '}<em>"{jobTitle}"</em> as complete on Sjoh.
        </Text>

        <Text style={text}>
          Take 30 seconds to drop a Verified Review — it shows up on their
          profile with a Verified Hire badge so the next customer knows
          they're the real deal. Or, if it didn't go well, tell us straight.
          That's how Sjoh stays full of pros who actually show up.
        </Text>

        <Section style={ctaSection}>
          <Button href={reviewUrl} style={cta}>
            Leave a Verified Review
          </Button>
        </Section>

        <Text style={smallText}>
          Or paste this link into your browser:<br />
          <a href={reviewUrl} style={link}>{reviewUrl}</a>
        </Text>

        <Text style={signoff}>
          Sharp,<br />
          The {SITE_NAME} team
        </Text>

        <Text style={footer}>
          You're getting this because <strong>{proName}</strong> logged a job
          with you on <a href={SITE_URL} style={link}>sjoh.co.za</a>.
          Sjoh takes no commission — payments happen directly between you and your pro.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: VerifiedReviewChaserEmail,
  subject: (data: Record<string, any>) =>
    `How did ${data?.proName ?? 'your pro'} do? Drop a Verified Review`,
  displayName: 'Verified review chaser',
  previewData: {
    jobTitle: 'Geyser swap-out in Parkhurst',
    proName: 'Khumalo Electrical',
    reviewUrl: 'https://sjoh.co.za/quote/abc-123/review',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const h1 = { fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f0f10', lineHeight: 1.15, margin: '0 0 16px' }
const lead = { fontSize: '16px', color: '#3a3a3d', lineHeight: 1.55, margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.6, margin: '0 0 24px' }
const smallText = { fontSize: '13px', color: '#6b6b70', lineHeight: 1.55, margin: '16px 0 0', textAlign: 'center' as const }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 4px' }
const cta = {
  backgroundColor: '#e8665a',
  color: '#ffffff',
  fontWeight: 800,
  fontSize: '15px',
  padding: '14px 28px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
}
const signoff = { fontSize: '15px', color: '#0f0f10', lineHeight: 1.5, margin: '32px 0 24px' }
const footer = { fontSize: '12px', color: '#888888', lineHeight: 1.5, margin: '24px 0 0', borderTop: '1px solid #eeeeee', paddingTop: '16px' }
const link = { color: '#e8665a', textDecoration: 'underline' }
