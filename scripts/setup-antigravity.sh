#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

echo "Sjoh Antigravity setup"
echo "Repo: $ROOT"
echo

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: This folder is not inside a Git repository."
  echo "Clone first:"
  echo "  git clone https://github.com/maxinefourie13/sjoh.git"
  echo "  cd sjoh"
  exit 1
fi

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
BRANCH="$(git branch --show-current 2>/dev/null || true)"

echo "Git remote: ${REMOTE_URL:-missing}"
echo "Git branch: ${BRANCH:-detached-or-missing}"

if [[ "$REMOTE_URL" != *"maxinefourie13/sjoh"* ]]; then
  echo "WARNING: origin does not look like the expected Sjoh GitHub repo."
fi

for required in package.json supabase wrangler.toml AGENTS.md; do
  if [[ ! -e "$required" ]]; then
    echo "ERROR: Missing expected project file/folder: $required"
    exit 1
  fi
done

cat > antigravity.config.template.json <<'JSON'
{
  "projectName": "sjoh",
  "projectType": "vite-react-supabase-cloudflare-pages",
  "repository": "https://github.com/maxinefourie13/sjoh.git",
  "productionDomain": "https://sjoh.co.za",
  "cloudflare": {
    "accountEmail": "sjohforwarding@gmail.com",
    "accountId": "7356313895a62a1f442cb17b7e4483bb",
    "pagesProject": "sjoh",
    "defaultPagesDomain": "https://sjoh.pages.dev",
    "buildCommand": "npm ci && npm run build",
    "outputDirectory": "dist"
  },
  "supabase": {
    "projectId": "omhjcalrfhswjmanriqv",
    "url": "https://omhjcalrfhswjmanriqv.supabase.co",
    "publicEnv": {
      "VITE_SUPABASE_PROJECT_ID": "omhjcalrfhswjmanriqv",
      "VITE_SUPABASE_URL": "https://omhjcalrfhswjmanriqv.supabase.co",
      "VITE_SUPABASE_PUBLISHABLE_KEY": "COPY_FROM_LOCAL_ENV_OR_SUPABASE_API_SETTINGS"
    },
    "serverSecretsRequiredInSupabaseOnly": [
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_DB_URL",
      "PAYFAST_MERCHANT_ID",
      "PAYFAST_MERCHANT_KEY",
      "PAYFAST_PASSPHRASE",
      "OPENAI_API_KEY",
      "RESEND_API_KEY"
    ]
  },
  "launchChecks": [
    "npm run lint",
    "npm test",
    "npm run build",
    "SITE_URL=https://sjoh.co.za npm run check:production"
  ],
  "agentEntryPoints": [
    "AGENTS.md",
    "docs/ANTIGRAVITY_HANDOFF.md",
    "docs/launch-board.md",
    "docs/launch-readiness.md",
    "docs/cloudflare-migration.md",
    "docs/agent-prompt-bank.md"
  ]
}
JSON

cat > .env.antigravity.template <<'ENV'
# Sjoh Antigravity local secret template
# Copy this file to .env.antigravity.local and fill values from your password manager.
# Never commit .env.antigravity.local.

# Public frontend build env
VITE_SUPABASE_PROJECT_ID=omhjcalrfhswjmanriqv
VITE_SUPABASE_URL=https://omhjcalrfhswjmanriqv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=replace-with-supabase-publishable-key

# Supabase server-side secrets. Keep these in Supabase Edge Function secrets, not Cloudflare Pages.
SUPABASE_SERVICE_ROLE_KEY=replace-with-service-role-key
SUPABASE_DB_URL=postgresql://postgres:<password>@db.omhjcalrfhswjmanriqv.supabase.co:5432/postgres
SUPABASE_DIRECT_URL=postgresql://postgres:<password>@db.omhjcalrfhswjmanriqv.supabase.co:5432/postgres

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=7356313895a62a1f442cb17b7e4483bb
CLOUDFLARE_PAGES_PROJECT=sjoh

# PayFast lives in Supabase secrets
PAYFAST_MERCHANT_ID=replace
PAYFAST_MERCHANT_KEY=replace
PAYFAST_PASSPHRASE=replace
PAYFAST_SANDBOX=0

# Optional service integrations
OPENAI_API_KEY=replace-if-used
RESEND_API_KEY=replace-if-used
EMAIL_FROM="Sjoh <hello@sjoh.co.za>"
EMAIL_SENDER_DOMAIN=sjoh.co.za
EMAIL_REPLY_TO=hello@sjoh.co.za
VITE_ONESIGNAL_APP_ID=replace-if-used
ENV

echo
echo "Created:"
echo "  antigravity.config.template.json"
echo "  .env.antigravity.template"
echo

echo "Antigravity CLI bootstrap:"
if command -v agy >/dev/null 2>&1; then
  echo "Detected AGY CLI: $(command -v agy)"
  agy --version || true
  echo
  echo "To start Antigravity in this repo:"
  echo "  cd \"$ROOT\""
  echo "  agy"
  echo
  echo "Suggested first command inside Antigravity:"
  echo "  /goal Read AGENTS.md and docs/ANTIGRAVITY_HANDOFF.md, then summarize launch blockers before making changes."
elif command -v antigravity >/dev/null 2>&1; then
  echo "Detected Antigravity CLI: $(command -v antigravity)"
  antigravity --version || true
  echo
  echo "To start Antigravity in this repo:"
  echo "  cd \"$ROOT\""
  echo "  antigravity"
else
  echo "No Antigravity CLI detected on PATH yet."
  echo "Install/open Google Antigravity, then add this folder as the project:"
  echo "  $ROOT"
  echo
  echo "If the AGY CLI is available after install, start it with:"
  echo "  cd \"$ROOT\""
  echo "  agy"
fi

echo
echo "Important: do not paste service-role keys into prompts. Store real secrets in:"
echo "  - Supabase project secrets for Edge Functions"
echo "  - Cloudflare Pages env vars only for VITE_* public values"
echo "  - Your password manager for personal records"
