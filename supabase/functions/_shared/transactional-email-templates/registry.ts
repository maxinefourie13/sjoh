/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as earlyAccessPro } from './early-access-pro.tsx'
import { template as earlyAccessCustomer } from './early-access-customer.tsx'
import { template as earlyAccessProWaitlist } from './early-access-pro-waitlist.tsx'
import { template as earlyAccessCustomerWaitlist } from './early-access-customer-waitlist.tsx'
import { template as verifiedReviewChaser } from './verified-review-chaser.tsx'
import { template as newJobInArea } from './new-job-in-area.tsx'
import { template as staleLeadFallback } from './stale-lead-fallback.tsx'
import { template as invoiceSent } from './invoice-sent.tsx'
import { template as billingRenewalReminder } from './billing-renewal-reminder.tsx'
import { template as billingProfileHidden } from './billing-profile-hidden.tsx'
import { template as billingProfileArchived } from './billing-profile-archived.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'early-access-pro': earlyAccessPro,
  'early-access-customer': earlyAccessCustomer,
  'early-access-pro-waitlist': earlyAccessProWaitlist,
  'early-access-customer-waitlist': earlyAccessCustomerWaitlist,
  'verified-review-chaser': verifiedReviewChaser,
  'new-job-in-area': newJobInArea,
  'stale-lead-fallback': staleLeadFallback,
  'invoice-sent': invoiceSent,
  'billing-renewal-reminder': billingRenewalReminder,
  'billing-profile-hidden': billingProfileHidden,
  'billing-profile-archived': billingProfileArchived,
}
