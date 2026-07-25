import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { LOGO_URL, SITE_NAME } from './brand.tsx'

const SITE_URL = 'https://sjoh.co.za'

interface LineItem {
  description: string
  qty: number
  unit_price: number
}

interface Props {
  invoiceNumber?: string
  businessName?: string
  customerName?: string
  issuedAt?: string
  lineItems?: LineItem[]
  subtotal?: number
  vat?: number
  total?: number
  vatIncluded?: boolean
  notes?: string | null
  invoiceUrl?: string
}

const formatRand = (amount = 0) =>
  `R ${Number(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const QuoteSentEmail = ({
  invoiceNumber = 'SJQ-0000',
  businessName = 'your Sjoh pro',
  customerName = 'there',
  issuedAt = new Date().toISOString(),
  lineItems = [],
  subtotal = 0,
  vat = 0,
  total = 0,
  vatIncluded = false,
  notes,
  invoiceUrl = SITE_URL,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Quote {invoiceNumber} from {businessName} via Sjoh</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentStrip}>
          <span style={{ ...stripBlock, backgroundColor: '#F5A623' }} />
          <span style={{ ...stripBlock, backgroundColor: '#DC2828' }} />
          <span style={{ ...stripBlock, backgroundColor: '#0A2463' }} />
          <span style={{ ...stripBlock, backgroundColor: '#0B6E3A' }} />
          <span style={{ ...stripBlock, backgroundColor: '#6B7CE8' }} />
          <span style={{ ...stripBlock, backgroundColor: '#E83E8C' }} />
        </Section>

        <Section style={brandSection}>
          <Img src={LOGO_URL} alt={SITE_NAME} width={110} style={logoImg} />
          <Text style={pill}>0% commission</Text>
        </Section>

        <Heading style={h1}>Quote from {businessName}</Heading>

        <Text style={lead}>
          Hi {customerName}, {businessName} has sent you quote{' '}
          <strong>{invoiceNumber}</strong> through Sjoh. This is an estimate —
          nothing is due yet.
        </Text>

        <Section style={summaryCard}>
          <Text style={label}>Quoted total</Text>
          <Text style={totalText}>{formatRand(total)}</Text>
          <Text style={muted}>
            Sent {new Date(issuedAt).toLocaleDateString('en-ZA', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </Section>

        <Section style={ctaSection}>
          <Button href={invoiceUrl} style={cta}>
            View / Download Quote
          </Button>
        </Section>

        <Text style={smallText}>
          Or paste this secure link into your browser:<br />
          <a href={invoiceUrl} style={link}>{invoiceUrl}</a>
        </Text>

        <Section style={table}>
          <Text style={tableHeading}>Quote details</Text>
          {lineItems.map((item, idx) => (
            <Section key={`${item.description}-${idx}`} style={row}>
              <Text style={rowDescription}>{item.description}</Text>
              <Text style={rowAmount}>
                {item.qty} x {formatRand(item.unit_price)}
              </Text>
            </Section>
          ))}
          <Hr style={hr} />
          <Section style={totalsRow}>
            <Text style={muted}>Subtotal</Text>
            <Text style={amount}>{formatRand(subtotal)}</Text>
          </Section>
          <Section style={totalsRow}>
            <Text style={muted}>{vatIncluded ? 'VAT (15%)' : 'VAT'}</Text>
            <Text style={amount}>{vatIncluded ? formatRand(vat) : 'Not applicable'}</Text>
          </Section>
          <Section style={totalsRow}>
            <Text style={totalLabel}>Quoted total</Text>
            <Text style={totalAmount}>{formatRand(total)}</Text>
          </Section>
        </Section>

        {notes ? (
          <Section style={notesCard}>
            <Text style={label}>Notes</Text>
            <Text style={text}>{notes}</Text>
          </Section>
        ) : null}

        <Text style={text}>
          Want to go ahead? Just reply to {businessName} to accept this quote.
          Payment is handled directly between you and {businessName} — Sjoh does
          not hold funds or take commission.
        </Text>

        <Text style={signoff}>
          Sharp,<br />
          The Sjoh team
        </Text>

        <Text style={footer}>
          You're getting this because {businessName} sent you a quote on{' '}
          <a href={SITE_URL} style={link}>sjoh.co.za</a>. Keep this email for your records.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: QuoteSentEmail,
  subject: (data: Record<string, any>) =>
    `Quote ${data?.invoiceNumber ?? ''} from ${data?.businessName ?? 'your Sjoh pro'}`,
  displayName: 'Quote sent',
  previewData: {
    invoiceNumber: 'SJQ-20260725-018',
    businessName: 'Jozi Spark Electrical',
    customerName: 'Thandi',
    issuedAt: new Date().toISOString(),
    lineItems: [
      { description: 'Electrical COC inspection and testing', qty: 1, unit_price: 1850 },
      { description: 'DB board tidy-up and labelled breakers', qty: 1, unit_price: 650 },
    ],
    subtotal: 2500,
    vat: 375,
    total: 2875,
    vatIncluded: true,
    notes: 'Quote valid for 30 days.',
    invoiceUrl: 'https://sjoh.co.za/invoice/example-token',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#FBFAF6',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '600px', margin: '0 auto', padding: '0 24px 40px', backgroundColor: '#ffffff' }
const accentStrip = { display: 'flex', height: '7px', margin: '0 -24px 28px' }
const stripBlock = { display: 'inline-block', width: '16.666%', height: '7px' }
const brandSection = { textAlign: 'center' as const, margin: '0 0 26px' }
const logoImg = { margin: '0 auto', display: 'block' as const }
const pill = {
  display: 'inline-block', backgroundColor: '#F5A623', color: '#0F1117', fontSize: '10px',
  fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' as const,
  borderRadius: '999px', padding: '6px 12px', margin: '8px 0 0',
}
const h1 = { fontSize: '30px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F1117', lineHeight: 1.12, margin: '0 0 16px' }
const lead = { fontSize: '16px', color: '#3A3D4A', lineHeight: 1.55, margin: '0 0 20px' }
const summaryCard = { backgroundColor: '#0F1117', borderRadius: '22px', padding: '22px', margin: '0 0 20px' }
const label = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#6B6F7E', margin: '0 0 8px' }
const totalText = { fontSize: '38px', fontWeight: 900, color: '#F5A623', margin: 0 }
const muted = { fontSize: '13px', color: '#6B6F7E', lineHeight: 1.45, margin: 0 }
const ctaSection = { textAlign: 'center' as const, margin: '4px 0 14px' }
const cta = {
  backgroundColor: '#F5A623', color: '#0F1117', fontWeight: 900, fontSize: '15px',
  padding: '14px 28px', borderRadius: '999px', textDecoration: 'none', display: 'inline-block',
}
const smallText = { fontSize: '12px', color: '#6B6F7E', lineHeight: 1.5, margin: '0 0 20px', textAlign: 'center' as const }
const table = { border: '1px solid #E4E6ED', borderRadius: '18px', padding: '18px', margin: '0 0 18px' }
const tableHeading = { fontSize: '15px', fontWeight: 900, color: '#0F1117', margin: '0 0 12px' }
const row = { padding: '10px 0', borderTop: '1px solid #F0F1F5' }
const rowDescription = { display: 'inline-block', width: '62%', fontSize: '14px', color: '#0F1117', margin: 0 }
const rowAmount = { display: 'inline-block', width: '38%', fontSize: '13px', color: '#3A3D4A', textAlign: 'right' as const, margin: 0 }
const hr = { borderColor: '#E4E6ED', margin: '12px 0' }
const totalsRow = { display: 'flex', justifyContent: 'space-between', margin: '8px 0' }
const amount = { fontSize: '13px', color: '#0F1117', textAlign: 'right' as const, margin: 0 }
const totalLabel = { fontSize: '14px', fontWeight: 900, color: '#0F1117', margin: 0 }
const totalAmount = { fontSize: '15px', fontWeight: 900, color: '#0B6E3A', textAlign: 'right' as const, margin: 0 }
const notesCard = { backgroundColor: '#FFF8EB', borderRadius: '16px', padding: '16px', margin: '0 0 18px' }
const text = { fontSize: '14px', color: '#3A3D4A', lineHeight: 1.6, margin: '0 0 18px' }
const signoff = { fontSize: '15px', color: '#0F1117', lineHeight: 1.5, margin: '28px 0 22px' }
const footer = { fontSize: '12px', color: '#888888', lineHeight: 1.5, margin: '24px 0 0', borderTop: '1px solid #eeeeee', paddingTop: '16px' }
const link = { color: '#0A2463', textDecoration: 'underline' }
