import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader } from './brand.tsx'

const SITE_NAME = 'Sjoh'
const SITE_URL = 'https://sjoh.co.za'

interface Props {
  jobTitle?: string
  description?: string
  categoryName?: string
  city?: string
  budget?: string | null
  jobUrl?: string
}

const NewJobInAreaEmail = ({
  jobTitle = 'A new job',
  description = '',
  categoryName = 'your category',
  city = 'your area',
  budget = null,
  jobUrl = SITE_URL,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {categoryName} job in {city} — first to quote wins</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />

        <Text style={kicker}>New job near you</Text>
        <Heading style={h1}>{jobTitle}</Heading>

        <Section style={metaBox}>
          <Text style={metaLine}><strong>Category:</strong> {categoryName}</Text>
          <Text style={metaLine}><strong>Location:</strong> {city}</Text>
          {budget ? <Text style={metaLine}><strong>Budget:</strong> {budget}</Text> : null}
        </Section>

        {description ? <Text style={text}>{description}</Text> : null}

        <Section style={ctaSection}>
          <Button href={jobUrl} style={cta}>View job & send a quote</Button>
        </Section>

        <Text style={smallText}>
          Quick quotes win jobs. The customer is waiting — dala what you must.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          You're getting this because you're listed on{' '}
          <a href={SITE_URL} style={link}>sjoh.co.za</a> for {categoryName} in {city}.
          Manage alerts in your dashboard.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewJobInAreaEmail,
  subject: (data: Record<string, any>) =>
    `New ${data?.categoryName ?? ''} job in ${data?.city ?? 'your area'}: ${data?.jobTitle ?? ''}`,
  displayName: 'New job in area',
  previewData: {
    jobTitle: 'Repaint front gate and fix hinges',
    description: 'Standard double gate, rust spots need sanding first. Photos on the job page.',
    categoryName: 'Painting',
    city: 'Polokwane',
    budget: 'R1,500 - R2,500',
    jobUrl: 'https://sjoh.co.za/leads/example',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const kicker = { fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#e8665a', margin: '0 0 8px' }
const h1 = { fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f0f10', lineHeight: 1.2, margin: '0 0 16px' }
const metaBox = { backgroundColor: '#fff5f4', border: '1px solid #fad5d1', borderRadius: '14px', padding: '14px 18px', margin: '0 0 16px' }
const metaLine = { fontSize: '14px', color: '#0f0f10', lineHeight: 1.6, margin: '2px 0' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.6, margin: '0 0 20px' }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 12px' }
const cta = {
  backgroundColor: '#0f0f10',
  color: '#ffffff',
  fontWeight: 800,
  fontSize: '15px',
  padding: '14px 28px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
}
const smallText = { fontSize: '13px', color: '#6b6b70', lineHeight: 1.55, margin: '0 0 4px', textAlign: 'center' as const }
const hr = { borderColor: '#eeeeee', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#888888', lineHeight: 1.5, margin: 0 }
const link = { color: '#e8665a', textDecoration: 'underline' }
