import { createHash, randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { createClient } from "@supabase/supabase-js";

type JsonObject = Record<string, unknown>;

type HermesTask = {
  id: string;
  campaign_id: string | null;
  task_type: "source_url_check" | "seed_page_scan" | "lead_row_validate" | "support_message_triage" | "heartbeat";
  payload: JsonObject;
  attempts: number;
  max_attempts: number;
};

type LeadRow = {
  lead_id?: string;
  business_name?: string;
  category?: string;
  service_keywords?: string;
  location_fit?: string;
  address?: string;
  city_area?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  source_name?: string;
  source_url?: string;
  source_checked_date?: string;
  contact_type?: string;
  popia_consent_status?: string;
  email_marketing_allowed_now?: string;
  allowed_next_step?: string;
  notes?: string;
};

type SupportMessage = {
  channel?: string;
  from?: string;
  subject?: string;
  body?: string;
  received_at?: string;
  attachments?: unknown[];
};

const CONTACT_TYPES = new Set([
  "no_email_found",
  "generic_business_email",
  "named_or_role_business_email",
  "consumer_or_named_email",
]);

const REQUIRED_LEAD_FIELDS = [
  "lead_id",
  "business_name",
  "category",
  "location_fit",
  "city_area",
  "province",
  "country",
  "source_name",
  "source_url",
  "source_checked_date",
  "contact_type",
  "popia_consent_status",
  "email_marketing_allowed_now",
  "allowed_next_step",
] as const;

const SPAM_PATTERNS: Array<[RegExp, string, number]> = [
  [/\b(guest post|backlink|link insertion|seo audit|rank on google|domain authority)\b/i, "SEO/link-building pitch", 35],
  [/\b(crypto|forex|binary options|casino|betting|loan offer|investment opportunity)\b/i, "finance or gambling spam", 40],
  [/\b(buy followers|instagram growth|telegram subscribers|whatsapp database|email list)\b/i, "growth/list spam", 40],
  [/\b(dear sir\/madam|dear website owner|kindly revert|business proposal)\b/i, "generic cold outreach wording", 20],
  [/\b(i can redesign your website|website development services|app development company)\b/i, "agency cold pitch", 30],
  [/\b(viagra|adult|xxx|escort)\b/i, "adult spam", 70],
];

const SUPPORT_BUCKET_PATTERNS: Array<[string, RegExp]> = [
  ["payment_billing", /\b(payfast|payment|paid|charged|card|subscription|billing|refund|invoice|r250|checkout|itn)\b/i],
  ["identity_privacy", /\b(id check|identity|id document|delete my data|privacy|popia|personal information|account deletion|remove my data)\b/i],
  ["login_account", /\b(login|log in|sign in|password|magic link|account|email verification|cannot access)\b/i],
  ["quote_job_flow", /\b(quote|request|job post|customer request|proposal|apply|lead|opportunity|urgent job)\b/i],
  ["listing_profile", /\b(listing|business profile|profile photo|service area|category|verified pro|business page)\b/i],
  ["email_delivery", /\b(email|receipt|notification|didn't receive|did not receive|spam folder)\b/i],
  ["abuse_safety", /\b(scam|fraud|unsafe|threat|harass|abuse|stolen|fake business|report)\b/i],
  ["sales_partnership", /\b(partnership|press|investor|advertising|sponsor|collaboration)\b/i],
];

const SUPPORT_P0_PATTERN = /\b(charged twice|unauthori[sz]ed|fraud|delete my data|privacy complaint|popia|id document leaked|can't pay|cannot pay|payment failed|live payment|refund)\b/i;
const SUPPORT_P1_PATTERN = /\b(cannot login|can't login|checkout broken|quote won't send|urgent|customer can't|business can't|invoice failed|email not received)\b/i;

const getEnv = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const WORKER_ID = process.env.HERMES_WORKER_ID ?? `${hostname()}-${randomUUID()}`;
const POLL_INTERVAL_MS = Number(process.env.HERMES_POLL_INTERVAL_MS ?? 15_000);
const FETCH_TIMEOUT_MS = Number(process.env.HERMES_FETCH_TIMEOUT_MS ?? 15_000);
const RUN_ONCE = process.argv.includes("--once");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const today = () => new Date().toISOString().slice(0, 10);

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asObject = (value: unknown): JsonObject =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};

const summarizeText = (value: string, limit = 180) => {
  const clean = value.replace(/\s+/g, " ").trim();
  return `${clean.slice(0, limit)}${clean.length > limit ? "..." : ""}`;
};

const assertHttpUrl = (value: unknown) => {
  const raw = asString(value);
  if (!raw) throw new Error("Task payload must include source_url or url");
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http(s) URLs are allowed");
  }
  return url.toString();
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

const classifyEmail = (email: string) => {
  if (!email) return "no_email_found";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (/^(info|hello|sales|admin|office|contact|bookings|support|enquiries|accounts)$/.test(local)) {
    return "generic_business_email";
  }
  if (/^(jobs|careers|hr|quotes|service|services|orders|reception)$/.test(local)) {
    return "named_or_role_business_email";
  }
  return "consumer_or_named_email";
};

const extractTitle = (html: string) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim().slice(0, 160) ?? null;
};

const extractEmails = (html: string) => {
  const matches = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return [...new Set(matches.map((email) => email.toLowerCase()))].slice(0, 10);
};

const extractPhones = (html: string) => {
  const matches = html.match(/(?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{4}|(?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{3,4}/g) ?? [];
  return [...new Set(matches.map((phone) => phone.replace(/\s+/g, " ").trim()))].slice(0, 10);
};

const extractLinks = (html: string, baseUrl: string) => {
  const links = new Set<string>();
  const matcher = /href=["']([^"']+)["']/gi;
  for (const match of html.matchAll(matcher)) {
    try {
      const href = match[1];
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;
      links.add(new URL(href, baseUrl).toString());
    } catch {
      // Ignore malformed links from source pages.
    }
  }
  return [...links].slice(0, 25);
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const fetchSource = async (sourceUrl: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Sjoh Hermes lead QA bot (+https://sjoh.co.za)",
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      final_url: response.url,
      content_type: contentType,
      body,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const validateLeadRow = (row: LeadRow) => {
  const errors: string[] = [];

  for (const field of REQUIRED_LEAD_FIELDS) {
    if (!asString(row[field])) errors.push(`${field} is required`);
  }

  const email = asString(row.email);
  const contactType = asString(row.contact_type);
  const checkedDate = asString(row.source_checked_date);
  const sourceUrl = asString(row.source_url);

  if (contactType && !CONTACT_TYPES.has(contactType)) {
    errors.push(`invalid contact_type ${contactType}`);
  }

  if (!email && contactType !== "no_email_found") {
    errors.push("empty email should use contact_type no_email_found");
  }

  if (email && contactType === "no_email_found") {
    errors.push("email is present but contact_type is no_email_found");
  }

  if (checkedDate && !isValidDate(checkedDate)) {
    errors.push("source_checked_date must be YYYY-MM-DD");
  }

  if (sourceUrl && !isHttpUrl(sourceUrl)) {
    errors.push("source_url must be an http(s) URL");
  }

  const allowedNow = asString(row.email_marketing_allowed_now);
  if (allowedNow && !["No", "Yes"].includes(allowedNow)) {
    errors.push("email_marketing_allowed_now must be Yes or No");
  }

  return errors;
};

const triageSupportMessage = (payload: JsonObject) => {
  const message = payload as SupportMessage;
  const subject = asString(message.subject);
  const body = asString(message.body);
  const combined = `${subject}\n${body}`;
  const attachments = Array.isArray(message.attachments) ? message.attachments.map((a) => asString(a)) : [];
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

  const matchedBucket = SUPPORT_BUCKET_PATTERNS.find(([, pattern]) => pattern.test(combined))?.[0] ?? "general_support";
  const priority =
    spamScore >= 50
      ? "spam"
      : SUPPORT_P0_PATTERN.test(combined)
        ? "p0"
        : SUPPORT_P1_PATTERN.test(combined)
          ? "p1"
          : matchedBucket === "payment_billing" || matchedBucket === "identity_privacy" || matchedBucket === "abuse_safety"
            ? "p1"
            : matchedBucket === "general_support" || matchedBucket === "sales_partnership"
              ? "p3"
              : "p2";
  const bucket = priority === "spam" ? "spam" : matchedBucket;

  const escalation =
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
    channel: asString(message.channel) || "manual",
    from: asString(message.from),
    subject,
    received_at: asString(message.received_at),
    bucket,
    priority,
    spam_score: Math.min(spamScore, 100),
    spam_signals: spamSignals,
    escalation,
    summary: `[${bucket}] ${summarizeText(subject || body || "No message text supplied")}`,
    suggested_reply:
      priority === "spam"
        ? null
        : bucket === "payment_billing"
          ? "Thanks for flagging this. We are checking the payment record and will come back with the exact status before making any billing changes."
          : bucket === "identity_privacy"
            ? "Thanks for reaching out. We treat identity and privacy requests carefully, so this has been escalated for manual review before we take action."
            : "Thanks for reaching out. We have received this and will come back to you shortly.",
    checked_at: new Date().toISOString(),
  };
};

const insertFinding = async (task: HermesTask, finding: JsonObject) => {
  const { error } = await supabase.from("hermes_findings").insert({
    campaign_id: task.campaign_id,
    task_id: task.id,
    ...finding,
  });
  if (error) throw error;
};

const completeTask = async (task: HermesTask, result: JsonObject) => {
  const { error } = await supabase
    .from("hermes_tasks")
    .update({
      status: "completed",
      result,
      completed_at: new Date().toISOString(),
      locked_by: null,
      locked_at: null,
    })
    .eq("id", task.id);
  if (error) throw error;
};

const failTask = async (task: HermesTask, errorMessage: string) => {
  const retry = task.attempts < task.max_attempts;
  const delaySeconds = Math.min(60 * task.attempts, 300);
  const { error } = await supabase
    .from("hermes_tasks")
    .update({
      status: retry ? "queued" : "failed",
      error_message: errorMessage,
      next_run_at: retry ? new Date(Date.now() + delaySeconds * 1000).toISOString() : new Date().toISOString(),
      locked_by: null,
      locked_at: null,
    })
    .eq("id", task.id);
  if (error) throw error;
};

const handleSourceUrlCheck = async (task: HermesTask) => {
  const sourceUrl = assertHttpUrl(task.payload.source_url ?? task.payload.url);
  const fetched = await fetchSource(sourceUrl);
  const title = fetched.content_type.includes("html") ? extractTitle(fetched.body) : null;

  const result = {
    source_url: sourceUrl,
    final_url: fetched.final_url,
    ok: fetched.ok,
    status_code: fetched.status,
    content_type: fetched.content_type,
    title,
    body_sha256: sha256(fetched.body),
    checked_at: new Date().toISOString(),
  };

  await insertFinding(task, {
    finding_type: "source_check",
    status: fetched.ok ? "new" : "needs_review",
    source_name: asString(task.payload.source_name) || new URL(sourceUrl).hostname,
    source_url: sourceUrl,
    source_checked_date: today(),
    confidence_score: fetched.ok ? 0.8 : 0.2,
    data: result,
    notes: fetched.ok ? "Source URL responded successfully." : `Source URL returned HTTP ${fetched.status}.`,
  });

  await completeTask(task, result);
};

const handleSeedPageScan = async (task: HermesTask) => {
  const sourceUrl = assertHttpUrl(task.payload.source_url ?? task.payload.url);
  const fetched = await fetchSource(sourceUrl);
  const title = fetched.content_type.includes("html") ? extractTitle(fetched.body) : null;
  const emails = extractEmails(fetched.body);
  const phones = extractPhones(fetched.body);
  const links = extractLinks(fetched.body, fetched.final_url);
  const firstEmail = emails[0] ?? "";
  const contactType = classifyEmail(firstEmail);

  const result = {
    source_url: sourceUrl,
    final_url: fetched.final_url,
    ok: fetched.ok,
    status_code: fetched.status,
    content_type: fetched.content_type,
    title,
    emails,
    phones,
    links,
    checked_at: new Date().toISOString(),
  };

  await insertFinding(task, {
    finding_type: "seed_scan",
    status: fetched.ok && (emails.length > 0 || phones.length > 0 || links.length > 0) ? "needs_review" : "new",
    source_name: asString(task.payload.source_name) || new URL(sourceUrl).hostname,
    source_url: sourceUrl,
    source_checked_date: today(),
    contact_type: contactType,
    allowed_next_step:
      contactType === "no_email_found"
        ? "No public email captured: verify details before outreach."
        : "Consent required: use once only for a consent request or contact through a source-supported channel.",
    confidence_score: fetched.ok ? 0.5 : 0.15,
    data: result,
    notes: "Seed scan extracts possible contact signals for human review; it does not approve outreach.",
  });

  await completeTask(task, result);
};

const handleLeadRowValidate = async (task: HermesTask) => {
  const rowsPayload = Array.isArray(task.payload.rows)
    ? task.payload.rows
    : task.payload.row
      ? [task.payload.row]
      : [];
  const rows = rowsPayload.map((row) => asObject(row) as LeadRow);
  if (rows.length === 0) throw new Error("Task payload must include row or rows");

  const reports = rows.map((row, index) => ({
    index,
    lead_id: asString(row.lead_id),
    business_name: asString(row.business_name),
    errors: validateLeadRow(row),
  }));

  const errorCount = reports.reduce((sum, report) => sum + report.errors.length, 0);
  const result = {
    rows_checked: rows.length,
    error_count: errorCount,
    reports,
    checked_at: new Date().toISOString(),
  };

  await insertFinding(task, {
    finding_type: "validation_report",
    status: errorCount === 0 ? "new" : "needs_review",
    source_checked_date: today(),
    confidence_score: errorCount === 0 ? 0.9 : 0.35,
    data: result,
    notes: errorCount === 0 ? "Lead row payload passed Hermes validation." : "Lead row payload needs fixes before import.",
  });

  await completeTask(task, result);
};

const handleSupportMessageTriage = async (task: HermesTask) => {
  const messagesPayload = Array.isArray(task.payload.messages)
    ? task.payload.messages
    : task.payload.message
      ? [task.payload.message]
      : [task.payload];
  const messages = messagesPayload.map((message) => asObject(message));
  const results = messages.map((message) => triageSupportMessage(message));
  const needsReview = results.some((result) => result.escalation !== "ignore");

  const result = {
    messages_checked: results.length,
    spam_count: results.filter((item) => item.priority === "spam").length,
    maxine_now_count: results.filter((item) => item.escalation === "maxine_now").length,
    codex_bugfix_count: results.filter((item) => item.escalation === "codex_bugfix").length,
    results,
    checked_at: new Date().toISOString(),
  };

  await insertFinding(task, {
    finding_type: "support_triage",
    status: needsReview ? "needs_review" : "new",
    source_name: "Sjoh support inbox",
    source_checked_date: today(),
    confidence_score: results.some((item) => item.priority === "spam") ? 0.75 : 0.65,
    data: result,
    notes: "Hermes support triage classifies spam, urgency, and escalation. It does not send customer replies.",
  });

  await completeTask(task, result);
};

const handleHeartbeat = async (task: HermesTask) => {
  await completeTask(task, {
    worker_id: WORKER_ID,
    ok: true,
    checked_at: new Date().toISOString(),
  });
};

const processTask = async (task: HermesTask) => {
  if (task.task_type === "source_url_check") return handleSourceUrlCheck(task);
  if (task.task_type === "seed_page_scan") return handleSeedPageScan(task);
  if (task.task_type === "lead_row_validate") return handleLeadRowValidate(task);
  if (task.task_type === "support_message_triage") return handleSupportMessageTriage(task);
  if (task.task_type === "heartbeat") return handleHeartbeat(task);
  throw new Error(`Unsupported task_type ${task.task_type}`);
};

const claimTask = async () => {
  const { data, error } = await supabase.rpc("claim_hermes_task", { _worker_id: WORKER_ID });
  if (error) throw error;
  return data as HermesTask | null;
};

const tick = async () => {
  const task = await claimTask();
  if (!task?.id) return false;

  console.log(`[hermes] claimed ${task.task_type} ${task.id}`);
  try {
    await processTask(task);
    console.log(`[hermes] completed ${task.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[hermes] failed ${task.id}: ${message}`);
    await failTask(task, message);
  }
  return true;
};

console.log(`[hermes] worker ${WORKER_ID} started`);

let keepRunning = true;
while (keepRunning) {
  const worked = await tick();
  if (RUN_ONCE) keepRunning = false;
  else if (!worked) await wait(POLL_INTERVAL_MS);
}
