import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://sjoh.co.za'

interface Props {
  businessName?: string
  renewalDate?: string
  amount?: string
}

const BillingRenewalReminder = ({
  businessName = 'your business',
  renewalDate = 'in 3 days',
  amount = 'R250',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Sjoh membership renews soon.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={wordmark}>sjoh<span style={bang}>!</span></Text>
        <Heading style={h1}>Your Sjoh membership renews soon.</Heading>
        <Text style={text}>
          Howzit. {businessName} is set to renew on <strong>{renewalDate}</strong>.
          PayFast will charge <strong>{amount}</strong> for the next month of Verified Pro.
        </Text>
        <Text style={text}>
          If everything still looks right, no action is needed. If you need to update or cancel before renewal,
          go to Billing in your Sjoh dashboard.
        </Text>
        <Section style={ctaSection}>
          <Button href={`${SITE_URL}/dashboard?section=billing`} style={cta}>Open Billing</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Sjoh keeps your job money between you and the customer. We charge only the membership fee.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BillingRenewalReminder,
  subject: 'Your Sjoh membership renews soon',
  displayName: 'Billing renewal reminder',
  previewData: {
    businessName: 'Willow Road Photography',
    renewalDate: '25 June 2026',
    amount: 'R250',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const wordmark = { fontSize: '26px', fontWeight: 900, color: '#0f0f10', margin: '0 0 28px' }
const bang = { color: '#F5A623' }
const h1 = { fontSize: '30px', fontWeight: 900, color: '#0f0f10', lineHeight: 1.12, margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.65, margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '26px 0' }
const cta = { backgroundColor: '#0f0f10', color: '#ffffff', borderRadius: '999px', padding: '14px 22px', fontWeight: 800, textDecoration: 'none' }
const hr = { borderColor: '#ececef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#7b7b82', lineHeight: 1.55, margin: 0 }
