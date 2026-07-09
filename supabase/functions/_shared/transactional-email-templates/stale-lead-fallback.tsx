import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader } from './brand.tsx'

const SITE_NAME = 'Sjoh'
const SITE_URL = 'https://sjoh.co.za'

interface FallbackPro {
  name: string
  slug: string
  city?: string
  province?: string
  rating?: number | null
  reviewCount?: number | null
}

interface Props {
  customerName?: string
  jobTitle?: string
  jobUrl?: string
  category?: string
  city?: string
  pros?: FallbackPro[]
}

const StaleLeadFallbackEmail = ({
  customerName = 'there',
  jobTitle = 'your job',
  jobUrl = SITE_URL,
  category = 'this kind of work',
  city = 'your area',
  pros = [],
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Still looking? Here are {pros.length} pros on Sjoh who might help.</Preview>
    <Body style={main}>
      <Container style={container}>
        <BrandHeader />

        <Heading style={h1}>Still looking for a {category} pro?</Heading>

        <Text style={lead}>
          Hi {customerName} — your request <em>"{jobTitle}"</em> hasn't picked
          up a quote yet. We don't want you stuck.
        </Text>

        <Text style={text}>
          Here are <strong>{pros.length} pro{pros.length === 1 ? '' : 's'}</strong> on Sjoh who might
          be able to help, even if they aren't right next door to {city}. Tap any of
          them to view their profile and reach out directly.
        </Text>

        {pros.map((p, i) => (
          <Section key={i} style={proCard}>
            <Text style={proName}>{p.name}</Text>
            <Text style={proMeta}>
              {[
                p.city && p.province ? `${p.city}, ${p.province}` : p.province || p.city,
                typeof p.rating === 'number' && p.rating > 0
                  ? `★ ${p.rating.toFixed(1)}${p.reviewCount ? ` (${p.reviewCount})` : ''}`
                  : null,
              ].filter(Boolean).join(' · ')}
            </Text>
            <Button href={`${SITE_URL}/business/${p.slug}`} style={proCta}>
              View profile
            </Button>
          </Section>
        ))}

        <Hr style={hr} />

        <Section style={ctaSection}>
          <Button href={jobUrl} style={cta}>
            Or revisit your original request
          </Button>
        </Section>

        <Text style={smallText}>
          You can also bump your job to the top of every pro's feed for R50 with{' '}
          <a href={`${SITE_URL}/pricing`} style={link}>Eish! Urgent</a>.
        </Text>

        <Text style={signoff}>
          Sharp,<br />
          The {SITE_NAME} team
        </Text>

        <Text style={footer}>
          You're getting this because you posted a request on{' '}
          <a href={SITE_URL} style={link}>sjoh.co.za</a>. We don't take a cut —
          payments happen directly between you and your pro.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: StaleLeadFallbackEmail,
  subject: (data: Record<string, any>) =>
    `Still looking? ${(data?.pros?.length ?? 0)} pros on Sjoh might help`,
  displayName: 'Stale lead fallback (24h)',
  previewData: {
    customerName: 'Thabo',
    jobTitle: 'Repaint front gate',
    jobUrl: 'https://sjoh.co.za/opportunities/abc-123',
    category: 'painting',
    city: 'Polokwane',
    pros: [
      { name: 'Khumalo Painters', slug: 'khumalo-painters', city: 'Pretoria', province: 'Gauteng', rating: 4.8, reviewCount: 24 },
      { name: 'BrushMasters SA', slug: 'brushmasters-sa', city: 'Johannesburg', province: 'Gauteng', rating: 4.6, reviewCount: 18 },
    ],
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 28px 40px' }
const h1 = { fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f0f10', lineHeight: 1.15, margin: '0 0 16px' }
const lead = { fontSize: '16px', color: '#3a3a3d', lineHeight: 1.55, margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3a3a3d', lineHeight: 1.6, margin: '0 0 24px' }
const smallText = { fontSize: '13px', color: '#6b6b70', lineHeight: 1.55, margin: '16px 0 0', textAlign: 'center' as const }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 4px' }
const cta = {
  backgroundColor: '#0f0f10',
  color: '#ffffff',
  fontWeight: 800,
  fontSize: '14px',
  padding: '12px 24px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
}
const proCard = {
  border: '1px solid #eeeeee',
  borderRadius: '14px',
  padding: '16px 18px',
  margin: '0 0 12px',
}
const proName = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#0f0f10',
  margin: '0 0 4px',
  letterSpacing: '-0.01em',
}
const proMeta = { fontSize: '13px', color: '#6b6b70', margin: '0 0 12px' }
const proCta = {
  backgroundColor: '#e8665a',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#eeeeee', margin: '24px 0 20px' }
const signoff = { fontSize: '15px', color: '#0f0f10', lineHeight: 1.5, margin: '32px 0 24px' }
const footer = { fontSize: '12px', color: '#888888', lineHeight: 1.5, margin: '24px 0 0', borderTop: '1px solid #eeeeee', paddingTop: '16px' }
const link = { color: '#e8665a', textDecoration: 'underline' }
