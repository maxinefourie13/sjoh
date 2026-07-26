import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { LOGO_URL, SITE_NAME } from './brand.tsx'

const SITE_URL = 'https://sjoh.co.za'

interface Props {
  businessName?: string
  dashboardUrl?: string
}

const ProfileCompletionEmail = ({
  businessName = 'your business',
  dashboardUrl = `${SITE_URL}/dashboard?section=profile`,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Add a photo to {businessName} — profiles with photos get contacted more</Preview>
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
        </Section>

        <Heading style={h1}>You're on Sjoh — now let customers see you.</Heading>

        <Text style={lead}>
          {businessName} is listed, but it's still using a placeholder picture.
          Adding a real logo or a photo of your work is the single biggest thing
          you can do to get contacted — profiles with photos get noticed far more
          than ones without.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>Two minutes, from your phone</Text>
          <Text style={cardItem}>📸 &nbsp;Add a logo or a cover photo</Text>
          <Text style={cardItem}>🛠️ &nbsp;Drop in a few shots of past jobs</Text>
          <Text style={cardItem}>✍️ &nbsp;Check your description reads well</Text>
        </Section>

        <Section style={ctaSection}>
          <Button href={dashboardUrl} style={cta}>
            Finish my profile
          </Button>
        </Section>

        <Text style={smallText}>
          Or paste this into your browser:<br />
          <a href={dashboardUrl} style={link}>{dashboardUrl}</a>
        </Text>

        <Text style={text}>
          Don't have a logo yet? You can hire a designer right here on Sjoh — and
          you can always add photos later as you go.
        </Text>

        <Text style={signoff}>
          Sharp,<br />
          The Sjoh team
        </Text>

        <Text style={footer}>
          You're getting this because you listed {businessName} on{' '}
          <a href={SITE_URL} style={link}>sjoh.co.za</a>. Once your profile is set up,
          you won't get this reminder again.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ProfileCompletionEmail,
  subject: (data: Record<string, any>) =>
    `Add a photo to ${data?.businessName ?? 'your Sjoh profile'} — it's the #1 thing customers look for`,
  displayName: 'Profile completion nudge',
  previewData: {
    businessName: 'Jozi Spark Electrical',
    dashboardUrl: 'https://sjoh.co.za/dashboard?section=profile',
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
const h1 = { fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F1117', lineHeight: 1.15, margin: '0 0 16px' }
const lead = { fontSize: '16px', color: '#3A3D4A', lineHeight: 1.55, margin: '0 0 22px' }
const card = { backgroundColor: '#FFF8EB', borderRadius: '18px', padding: '20px 22px', margin: '0 0 24px' }
const cardLabel = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#8a6d2f', margin: '0 0 12px' }
const cardItem = { fontSize: '15px', color: '#0F1117', lineHeight: 1.5, margin: '0 0 8px' }
const ctaSection = { textAlign: 'center' as const, margin: '4px 0 18px' }
const cta = {
  backgroundColor: '#0B6E3A', color: '#ffffff', fontWeight: 900, fontSize: '15px',
  padding: '14px 30px', borderRadius: '999px', textDecoration: 'none', display: 'inline-block',
}
const smallText = { fontSize: '12px', color: '#6B6F7E', lineHeight: 1.5, margin: '0 0 22px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#3A3D4A', lineHeight: 1.6, margin: '0 0 18px' }
const signoff = { fontSize: '15px', color: '#0F1117', lineHeight: 1.5, margin: '28px 0 22px' }
const footer = { fontSize: '12px', color: '#888888', lineHeight: 1.5, margin: '24px 0 0', borderTop: '1px solid #eeeeee', paddingTop: '16px' }
const link = { color: '#0A2463', textDecoration: 'underline' }
