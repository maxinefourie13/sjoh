#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="omhjcalrfhswjmanriqv"
SUPABASE_CLI="${SUPABASE_CLI:-/private/tmp/supabase-cli/supabase}"
SHOW_SECRETS="${SHOW_SECRETS:-0}"
MISSING_REQUIRED=()

if [[ ! -x "$SUPABASE_CLI" ]]; then
  echo "Supabase CLI not found at $SUPABASE_CLI"
  exit 1
fi

set_secret() {
  local name="$1"
  local required="${2:-optional}"
  local value

  if [[ "$required" == "required" ]]; then
    printf "%s (required): " "$name" >&2
  else
    printf "%s (optional, press Enter to skip): " "$name" >&2
  fi

  if [[ "$SHOW_SECRETS" == "1" ]]; then
    IFS= read -r value
  else
    IFS= read -r -s value
  fi
  printf "\n" >&2

  if [[ -z "$value" ]]; then
    if [[ "$required" == "required" ]]; then
      echo "Skipped required secret: $name" >&2
      MISSING_REQUIRED+=("$name")
    fi
    return 0
  fi

  "$SUPABASE_CLI" secrets set "$name=$value" \
    --project-ref "$PROJECT_REF" \
    --workdir "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
}

echo "This stores secrets in Supabase for project $PROJECT_REF."
if [[ "$SHOW_SECRETS" == "1" ]]; then
  echo "Visible-entry mode is ON, so you can see what you type."
  echo "Only use this when no one else can see your screen."
else
  echo "Values are hidden while typing and are not written to your shell history."
fi
echo

set_secret "PAYFAST_MERCHANT_ID" "required"
set_secret "PAYFAST_MERCHANT_KEY" "required"
set_secret "PAYFAST_PASSPHRASE" "required"
set_secret "PAYFAST_SANDBOX" "optional"
set_secret "PUBLIC_SITE_URL" "optional"
set_secret "OPENAI_API_KEY" "required"
set_secret "OPENAI_VISION_MODEL" "optional"
set_secret "GOOGLE_PLACES_API_KEY" "optional"
set_secret "RESEND_API_KEY" "required"
set_secret "EMAIL_FROM" "optional"
set_secret "EMAIL_SENDER_DOMAIN" "optional"
set_secret "EMAIL_REPLY_TO" "optional"
set_secret "EMAIL_PREVIEW_API_KEY" "optional"
set_secret "EMAIL_SUPPRESSION_WEBHOOK_SECRET" "optional"
set_secret "ONESIGNAL_APP_ID" "optional"
set_secret "ONESIGNAL_REST_API_KEY" "optional"

echo
echo "Done. Current Supabase secret names:"
"$SUPABASE_CLI" secrets list \
  --project-ref "$PROJECT_REF" \
  --workdir "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if (( ${#MISSING_REQUIRED[@]} > 0 )); then
  echo
  echo "Still missing required launch secrets:"
  printf ' - %s\n' "${MISSING_REQUIRED[@]}"
  exit 1
fi
