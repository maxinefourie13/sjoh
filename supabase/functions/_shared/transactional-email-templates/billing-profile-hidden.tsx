import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://sjoh.co.za'

interface Props {
  businessName?: string
  daysLeft?: number
}

const BillingProfileHidden = ({
  businessName = 'your business profile',
  daysLeft = 20,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Sjoh business profile is hidden until billing is sorted.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={wordmark}>sjoh<span style={bang}>!</span></Text>
        <Heading style={h1}>Your profile is saved, but hidden.</Heading>
        <Text style={text}>
          The membership for <strong>{businessName}</strong> needs attention, so customers cannot see the profile
          or request quotes from it right now.
        </Text>
        <Text style={text}>
          We keep the business profile safely on Sjoh for 30 days after access lapses. You have about
          <strong> {daysLeft} day{daysLeft === 1 ? '' : 's'} left</strong> before it is archived.
        </Text>
        <Section style={ctaSection}>
          <Button href={`${SITE_URL}/dashboard?section=billing`} style={cta}>Reactivate Verified Pro</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Your details, photos and profile copy are still there. Reactivate and we bring the profile back.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BillingProfileHidden,
  subject: 'Your Sjoh profile is hidden until billing is sorted',
  displayName: 'Billing profile hidden',
  previewData: {
    businessName: 'Willow Road Photography',
    daysLeft: 20,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const wordmark = { fontSize: '26px', fontWeight: 900, color: '#0f0f10', margin: '0 0 28px' }
const bang = { color: '#F5A623' }
const h1 = { fontSize: '30px', fontWeight: 900, color: '#0f0f10', lineHeight: 1.12, margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.65, margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '26px 0' }
const cta = { backgroundColor: '#F5A623', color: '#111111', borderRadius: '999px', padding: '14px 22px', fontWeight: 900, textDecoration: 'none' }
const hr = { borderColor: '#ececef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#7b7b82', lineHeight: 1.55, margin: 0 }
