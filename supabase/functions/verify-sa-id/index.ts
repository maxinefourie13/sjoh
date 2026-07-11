// Sjoh ID Check.
// Compares the name and South African ID number typed by the pro with text
// extracted from their uploaded ID document. This is a document-match check,
// not a government database or liveness verification.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Submission = {
  id: string;
  user_id: string;
  business_id: string;
  full_name: string;
  id_number: string;
  document_path: string;
};

type ExtractionResult = {
  full_name: string | null;
  id_number: string | null;
  confidence: number | null;
  document_type: string | null;
  notes: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Sign in to verify your ID" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json({ error: "Supabase environment is not configured" }, 500);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userId = claimsData.claims.sub as string;

  let body: { submission_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.submission_id) {
    return json({ error: "submission_id is required" }, 400);
  }

  const { data: submission, error: submissionError } = await admin
    .from("id_verification_submissions")
    .select("id, user_id, business_id, full_name, id_number, document_path")
    .eq("id", body.submission_id)
    .maybeSingle();

  if (submissionError) return json({ error: "Could not load ID check" }, 500);
  if (!submission) return json({ error: "ID check not found" }, 404);
  if ((submission as Submission).user_id !== userId) {
    return json({ error: "You can only process your own ID check" }, 403);
  }

  const check = submission as Submission;
  await setSubmissionStatus(admin, check.id, "processing");

  if (!isValidSouthAfricanId(check.id_number)) {
    return fail(admin, check, "The ID number must be a valid 13-digit South African ID number.");
  }

  // Prefer Gemini (free tier covers launch volume); fall back to OpenAI.
  const visionKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("OPENAI_API_KEY");
  if (!visionKey) {
    return needsReview(admin, check, "Automated ID document reading is not configured yet.");
  }

  const { data: signed, error: signedError } = await admin.storage
    .from("id-verification-documents")
    .createSignedUrl(check.document_path, 60 * 5);

  if (signedError || !signed?.signedUrl) {
    return needsReview(admin, check, "We could not open the uploaded ID document.");
  }

  let extracted: ExtractionResult;
  try {
    extracted = await extractIdText(visionKey, signed.signedUrl);
  } catch (err) {
    console.error("ID extraction failed", err);
    return needsReview(admin, check, "We could not read the ID document. Please upload a clearer photo.");
  }

  const typedId = check.id_number.replace(/\D/g, "");
  const extractedId = (extracted.id_number ?? "").replace(/\D/g, "");
  const idMatches = typedId === extractedId;
  const nameScore = scoreNameMatch(check.full_name, extracted.full_name ?? "");
  const verified = idMatches && nameScore >= 0.72;
  const matchScore = Math.round(((idMatches ? 1 : 0) * 0.65 + nameScore * 0.35) * 100) / 100;

  if (!verified) {
    const reason = !idMatches
      ? "The ID number you typed does not match the uploaded document."
      : "The name you typed does not clearly match the uploaded document.";
    await admin
      .from("id_verification_submissions")
      .update({
        status: "failed",
        extracted_name: extracted.full_name,
        extracted_id_number: extracted.id_number,
        match_score: matchScore,
        failure_reason: reason,
        provider: "sjoh-openai-document-match",
        processed_at: new Date().toISOString(),
      })
      .eq("id", check.id);

    await setProviderBalance(admin, check.user_id, false, "failed");
    return json({ ok: false, verified: false, status: "failed", reason, match_score: matchScore }, 200);
  }

  const now = new Date().toISOString();
  await admin
    .from("id_verification_submissions")
    .update({
      status: "verified",
      extracted_name: extracted.full_name,
      extracted_id_number: extracted.id_number,
      match_score: matchScore,
      failure_reason: null,
      provider: "sjoh-openai-document-match",
      processed_at: now,
    })
    .eq("id", check.id);

  await admin
    .from("businesses")
    .update({
      kyc_verified: true,
      kyc_reference: `sjoh-id-check:${check.id}`,
      kyc_verified_at: now,
    })
    .eq("id", check.business_id)
    .eq("owner_id", check.user_id);

  await setProviderBalance(admin, check.user_id, true, "verified");
  return json({ ok: true, verified: true, status: "verified", match_score: matchScore }, 200);
});

async function extractIdText(visionKey: string, signedUrl: string): Promise<ExtractionResult> {
  // Gemini exposes an OpenAI-compatible endpoint, so both providers share
  // this request shape; GEMINI_API_KEY selects Gemini's endpoint and model.
  const useGemini = Boolean(Deno.env.get("GEMINI_API_KEY"));
  const endpoint = useGemini
    ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = Deno.env.get("OPENAI_VISION_MODEL") ?? (useGemini ? "gemini-flash-latest" : "gpt-4o-mini");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${visionKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract identity details from a South African ID document image. Return only JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Read the document and return JSON with keys: full_name, id_number, confidence, document_type, notes. If a value is unreadable, use null. Do not guess.",
            },
            { type: "image_url", image_url: { url: signedUrl } },
          ],
        },
      ],
    }),
  });

  const jsonBody = await response.json();
  if (!response.ok) {
    console.error("OpenAI extraction error", response.status, jsonBody);
    throw new Error("Extraction provider failed");
  }

  const content = jsonBody?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No extraction content");
  return JSON.parse(content) as ExtractionResult;
}

async function fail(admin: any, submission: Submission, reason: string) {
  await admin
    .from("id_verification_submissions")
    .update({
      status: "failed",
      failure_reason: reason,
      processed_at: new Date().toISOString(),
    })
    .eq("id", submission.id);
  await setProviderBalance(admin, submission.user_id, false, "failed");
  return json({ ok: false, verified: false, status: "failed", reason }, 200);
}

async function needsReview(admin: any, submission: Submission, reason: string) {
  await admin
    .from("id_verification_submissions")
    .update({
      status: "needs_review",
      failure_reason: reason,
      processed_at: new Date().toISOString(),
    })
    .eq("id", submission.id);
  await setProviderBalance(admin, submission.user_id, false, "pending");
  return json({ ok: false, verified: false, status: "needs_review", reason }, 200);
}

async function setSubmissionStatus(admin: any, submissionId: string, status: string) {
  await admin
    .from("id_verification_submissions")
    .update({ status })
    .eq("id", submissionId);
}

async function setProviderBalance(admin: any, userId: string, verified: boolean, status: string) {
  await admin
    .from("provider_balances")
    .update({
      is_id_verified: verified,
      verification_status: status,
      verification_expires_at: verified ? oneYearFromNow() : null,
    })
    .eq("user_id", userId);
}

function oneYearFromNow() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((part) => part.length > 1);
}

function scoreNameMatch(typed: string, extracted: string) {
  const typedParts = normalizeName(typed);
  const extractedParts = new Set(normalizeName(extracted));
  if (!typedParts.length || !extractedParts.size) return 0;
  const matched = typedParts.filter((part) => extractedParts.has(part)).length;
  return matched / typedParts.length;
}

function isValidSouthAfricanId(idNumber: string) {
  const digits = idNumber.replace(/\D/g, "");
  if (!/^\d{13}$/.test(digits)) return false;
  let oddSum = 0;
  for (let i = 0; i < 12; i += 2) oddSum += Number(digits[i]);
  const evenConcat = digits
    .slice(0, 12)
    .split("")
    .filter((_, index) => index % 2 === 1)
    .join("");
  const evenSum = String(Number(evenConcat) * 2)
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
  const checkDigit = (10 - ((oddSum + evenSum) % 10)) % 10;
  return checkDigit === Number(digits[12]);
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
