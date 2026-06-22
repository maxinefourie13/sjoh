import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://sjoh.co.za'

interface Props {
  businessName?: string
}

const BillingProfileArchived = ({
  businessName = 'your business profile',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Sjoh business profile has been archived.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={wordmark}>sjoh<span style={bang}>!</span></Text>
        <Heading style={h1}>Your business profile is archived.</Heading>
        <Text style={text}>
          We kept <strong>{businessName}</strong> hidden for 30 days after the membership lapsed. It is now archived,
          which means customers cannot find it and quoting tools stay locked.
        </Text>
        <Text style={text}>
          We have not deleted your profile work. Reactivate Verified Pro and you can bring the business profile back
          without rebuilding it from scratch.
        </Text>
        <Section style={ctaSection}>
          <Button href={`${SITE_URL}/dashboard?section=billing`} style={cta}>Bring my profile back</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Need help? Reply to this email and the Sjoh team will help you sort it.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BillingProfileArchived,
  subject: 'Your Sjoh business profile has been archived',
  displayName: 'Billing profile archived',
  previewData: {
    businessName: 'Willow Road Photography',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const wordmark = { fontSize: '26px', fontWeight: 900, color: '#0f0f10', margin: '0 0 28px' }
const bang = { color: '#F5A623' }
const h1 = { fontSize: '30px', fontWeight: 900, color: '#0f0f10', lineHeight: 1.12, margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.65, margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '26px 0' }
const cta = { backgroundColor: '#0f0f10', color: '#ffffff', borderRadius: '999px', padding: '14px 22px', fontWeight: 900, textDecoration: 'none' }
const hr = { borderColor: '#ececef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#7b7b82', lineHeight: 1.55, margin: 0 }
