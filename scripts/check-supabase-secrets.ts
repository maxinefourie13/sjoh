import { spawnSync } from "node:child_process";

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "omhjcalrfhswjmanriqv";

const requiredSecrets = [
  "PAYFAST_MERCHANT_ID",
  "PAYFAST_MERCHANT_KEY",
  "PAYFAST_PASSPHRASE",
  "PUBLIC_SITE_URL",
  "OPENAI_API_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_SENDER_DOMAIN",
  "EMAIL_REPLY_TO",
];

const optionalSecrets = [
  "OPENAI_VISION_MODEL",
  "GOOGLE_PLACES_API_KEY",
  "EMAIL_PREVIEW_API_KEY",
  "EMAIL_SUPPRESSION_WEBHOOK_SECRET",
  "ONESIGNAL_APP_ID",
  "ONESIGNAL_REST_API_KEY",
];

function commandExists(command: string) {
  return spawnSync("sh", ["-lc", `command -v ${command}`], { encoding: "utf8" }).status === 0;
}

function supabaseCommand() {
  if (process.env.SUPABASE_CLI) {
    return {
      command: process.env.SUPABASE_CLI,
      args: [] as string[],
    };
  }

  if (commandExists("supabase")) {
    return {
      command: "supabase",
      args: [] as string[],
    };
  }

  return {
    command: "npx",
    args: ["-y", "supabase@latest"],
  };
}

const cli = supabaseCommand();
const result = spawnSync(
  cli.command,
  [
    ...cli.args,
    "secrets",
    "list",
    "--project-ref",
    projectRef,
    "--workdir",
    ".",
    "--output-format",
    "json",
  ],
  { encoding: "utf8" },
);

if (result.status !== 0) {
  console.error(result.stderr.trim() || result.stdout.trim() || "Unable to list Supabase secret names.");
  process.exit(result.status ?? 1);
}

type SupabaseSecret = {
  name: string;
};

let secrets: SupabaseSecret[];

try {
  secrets = JSON.parse(result.stdout) as SupabaseSecret[];
} catch (error) {
  console.error("Supabase did not return JSON. Raw output:");
  console.error(result.stdout.trim());
  process.exit(1);
}

const present = new Set(secrets.map((secret) => secret.name));
const missingRequired = requiredSecrets.filter((name) => !present.has(name));
const missingOptional = optionalSecrets.filter((name) => !present.has(name));

console.log(`Supabase project: ${projectRef}`);
console.log("Required launch secrets:");
for (const name of requiredSecrets) {
  console.log(` - ${present.has(name) ? "OK" : "MISSING"} ${name}`);
}

console.log("\nOptional launch secrets:");
for (const name of optionalSecrets) {
  console.log(` - ${present.has(name) ? "OK" : "missing"} ${name}`);
}

if (missingRequired.length > 0) {
  console.error("\nMissing required launch secrets:");
  for (const name of missingRequired) {
    console.error(` - ${name}`);
  }
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.log("\nOptional secrets not present yet:");
  for (const name of missingOptional) {
    console.log(` - ${name}`);
  }
}
