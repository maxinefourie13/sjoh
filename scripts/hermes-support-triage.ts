import { readFileSync } from "node:fs";

type SupportMessage = {
  id?: string;
  channel?: "email" | "whatsapp" | "site_form" | "manual" | string;
  from?: string;
  subject?: string;
  body?: string;
  received_at?: string;
  attachments?: string[];
};

type TriageResult = {
  id: string;
  bucket: string;
  priority: "p0" | "p1" | "p2" | "p3" | "spam";
  spam_score: number;
  spam_signals: string[];
  escalation: "maxine_now" | "codex_bugfix" | "draft_reply" | "quarantine" | "ignore";
  summary: string;
  suggested_reply: string | null;
};

const SPAM_PATTERNS: Array<[RegExp, string, number]> = [
  [/\b(guest post|backlink|link insertion|seo audit|rank on google|domain authority)\b/i, "SEO/link-building pitch", 35],
  [/\b(crypto|forex|binary options|casino|betting|loan offer|investment opportunity)\b/i, "finance or gambling spam", 40],
  [/\b(buy followers|instagram growth|telegram subscribers|whatsapp database|email list)\b/i, "growth/list spam", 40],
  [/\b(dear sir\/madam|dear website owner|kindly revert|business proposal)\b/i, "generic cold outreach wording", 20],
  [/\b(i can redesign your website|website development services|app development company)\b/i, "agency cold pitch", 30],
  [/\b(viagra|adult|xxx|escort)\b/i, "adult spam", 70],
];

const BUCKET_PATTERNS: Array<[string, RegExp]> = [
  ["payment_billing", /\b(payfast|payment|paid|charged|card|subscription|billing|refund|invoice|r250|checkout|itn)\b/i],
  ["identity_privacy", /\b(id check|identity|id document|delete my data|privacy|popia|personal information|account deletion|remove my data)\b/i],
  ["login_account", /\b(login|log in|sign in|password|magic link|account|email verification|cannot access)\b/i],
  ["quote_job_flow", /\b(quote|request|job post|customer request|proposal|apply|lead|opportunity|urgent job)\b/i],
  ["listing_profile", /\b(listing|business profile|profile photo|service area|category|verified pro|business page)\b/i],
  ["email_delivery", /\b(email|receipt|notification|didn't receive|did not receive|spam folder)\b/i],
  ["abuse_safety", /\b(scam|fraud|unsafe|threat|harass|abuse|stolen|fake business|report)\b/i],
  ["sales_partnership", /\b(partnership|press|investor|advertising|sponsor|collaboration)\b/i],
];

const P0_PATTERN = /\b(charged twice|unauthori[sz]ed|fraud|delete my data|privacy complaint|popia|id document leaked|can't pay|cannot pay|payment failed|live payment|refund)\b/i;
const P1_PATTERN = /\b(cannot login|can't login|checkout broken|quote won't send|urgent|customer can't|business can't|invoice failed|email not received)\b/i;

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const summarize = (message: SupportMessage, bucket: string) => {
  const subject = clean(message.subject);
  const body = clean(message.body).replace(/\s+/g, " ");
  const text = subject || body || "No message text supplied";
  return `[${bucket}] ${text.slice(0, 180)}${text.length > 180 ? "..." : ""}`;
};

const draftReply = (message: SupportMessage, bucket: string, priority: TriageResult["priority"]) => {
  const name = clean(message.from).split("@")[0] || "there";
  if (priority === "spam") return null;
  if (bucket === "payment_billing") {
    return `Hi ${name}, thanks for flagging this. We are checking the payment record and will come back with the exact status before making any billing changes.`;
  }
  if (bucket === "identity_privacy") {
    return `Hi ${name}, thanks for reaching out. We treat identity and privacy requests carefully, so this has been escalated for manual review before we take action.`;
  }
  if (bucket === "login_account") {
    return `Hi ${name}, thanks for the heads-up. Please try the email/password login again, and we are checking whether anything is blocking your account access.`;
  }
  if (bucket === "quote_job_flow") {
    return `Hi ${name}, thanks for telling us. We are checking the request/quote flow now and will come back with the next step shortly.`;
  }
  return `Hi ${name}, thanks for reaching out. We have received this and will come back to you shortly.`;
};

export const triageSupportMessage = (message: SupportMessage): TriageResult => {
  const id = clean(message.id) || `support-${Date.now()}`;
  const subject = clean(message.subject);
  const body = clean(message.body);
  const combined = `${subject}\n${body}`;
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const spamSignals: string[] = [];
  let spamScore = 0;

  for (const [pattern, label, score] of SPAM_PATTERNS) {
    if (pattern.test(combined)) {
      spamSignals.push(label);
      spamScore += score;
    }
  }

  const urlCount = (combined.match(/https?:\/\//gi) ?? []).length;
  if (urlCount >= 3) {
    spamSignals.push("multiple links");
    spamScore += 20;
  }

  if (attachments.some((name) => /\.(exe|scr|bat|cmd|js|vbs|zip|rar)$/i.test(name))) {
    spamSignals.push("risky attachment type");
    spamScore += 35;
  }

  if (!subject && body.length < 12) {
    spamSignals.push("too little context");
    spamScore += 12;
  }

  const matchedBucket = BUCKET_PATTERNS.find(([, pattern]) => pattern.test(combined))?.[0] ?? "general_support";
  const priority: TriageResult["priority"] =
    spamScore >= 50
      ? "spam"
      : P0_PATTERN.test(combined)
        ? "p0"
        : P1_PATTERN.test(combined)
          ? "p1"
          : matchedBucket === "payment_billing" || matchedBucket === "identity_privacy" || matchedBucket === "abuse_safety"
            ? "p1"
            : matchedBucket === "general_support" || matchedBucket === "sales_partnership"
              ? "p3"
              : "p2";
  const bucket = priority === "spam" ? "spam" : matchedBucket;

  const escalation: TriageResult["escalation"] =
    priority === "spam"
      ? spamScore >= 80
        ? "ignore"
        : "quarantine"
      : priority === "p0"
        ? "maxine_now"
        : priority === "p1" && ["payment_billing", "identity_privacy", "abuse_safety"].includes(bucket)
          ? "maxine_now"
          : ["quote_job_flow", "login_account", "email_delivery"].includes(bucket)
            ? "codex_bugfix"
            : "draft_reply";

  return {
    id,
    bucket,
    priority,
    spam_score: Math.min(spamScore, 100),
    spam_signals: spamSignals,
    escalation,
    summary: summarize(message, bucket),
    suggested_reply: draftReply(message, bucket, priority),
  };
};

const readInput = () => {
  const file = process.argv[2];
  if (!file || file === "--help" || file === "-h") {
    console.log("Usage: npm run hermes:support-triage -- support-messages.json");
    console.log("Input: a JSON message object or an array of message objects.");
    process.exit(file ? 0 : 1);
  }

  const parsed = JSON.parse(readFileSync(file, "utf8")) as SupportMessage | SupportMessage[];
  return Array.isArray(parsed) ? parsed : [parsed];
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const messages = readInput();
  const results = messages.map(triageSupportMessage);
  console.log(JSON.stringify({ checked_at: new Date().toISOString(), count: results.length, results }, null, 2));
}
