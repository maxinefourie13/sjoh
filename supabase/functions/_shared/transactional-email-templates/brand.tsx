import * as React from 'npm:react@18.3.1'
import { Img, Section } from 'npm:@react-email/components@0.0.22'

export const SITE_URL = 'https://sjoh.co.za'
export const SITE_NAME = 'Sjoh'
export const LOGO_URL = `${SITE_URL}/email/sjoh-logo.png`

const brandSection = { textAlign: 'center' as const, margin: '0 0 28px' }
const logoImg = { margin: '0 auto', display: 'block' as const }

export const BrandHeader = ({ width = 120 }: { width?: number }) => (
  <Section style={brandSection}>
    <Img src={LOGO_URL} alt={SITE_NAME} width={width} style={logoImg} />
  </Section>
)
