import { readFileSync } from "fs";

const REQUIRED_COLUMNS = [
  "lead_id",
  "business_name",
  "category",
  "service_keywords",
  "location_fit",
  "address",
  "city_area",
  "province",
  "country",
  "phone",
  "email",
  "website",
  "source_name",
  "source_url",
  "source_checked_date",
  "contact_type",
  "popia_consent_status",
  "email_marketing_allowed_now",
  "allowed_next_step",
  "notes",
] as const;

const CONTACT_TYPES = new Set([
  "no_email_found",
  "generic_business_email",
  "named_or_role_business_email",
  "consumer_or_named_email",
]);

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim()));
};

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: npm run validate:leads -- <csv-file> [more-files]");
  process.exit(1);
}

let totalRows = 0;
let totalErrors = 0;
const seenLeadIds = new Map<string, string>();

for (const file of files) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  const [header, ...dataRows] = rows;
  const errors: string[] = [];

  if (!header) {
    errors.push("CSV is empty");
  } else {
    const missing = REQUIRED_COLUMNS.filter((column) => !header.includes(column));
    if (missing.length > 0) errors.push(`Missing columns: ${missing.join(", ")}`);
  }

  const indexes = new Map<string, number>();
  header?.forEach((column, index) => indexes.set(column, index));
  const value = (row: string[], column: string) => row[indexes.get(column) ?? -1]?.trim() ?? "";

  dataRows.forEach((row, rowIndex) => {
    const line = rowIndex + 2;
    totalRows += 1;

    if (row.length !== header.length) {
      errors.push(`Line ${line}: expected ${header.length} columns, found ${row.length}`);
      return;
    }

    const leadId = value(row, "lead_id");
    const email = value(row, "email");
    const contactType = value(row, "contact_type");
    const checkedDate = value(row, "source_checked_date");
    const sourceUrl = value(row, "source_url");

    for (const column of [
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
    ]) {
      if (!value(row, column)) errors.push(`Line ${line}: ${column} is required`);
    }

    if (leadId) {
      const duplicate = seenLeadIds.get(leadId);
      if (duplicate) errors.push(`Line ${line}: duplicate lead_id ${leadId} also appears in ${duplicate}`);
      else seenLeadIds.set(leadId, `${file}:${line}`);
    }

    if (contactType && !CONTACT_TYPES.has(contactType)) {
      errors.push(`Line ${line}: invalid contact_type ${contactType}`);
    }

    if (!email && contactType !== "no_email_found") {
      errors.push(`Line ${line}: empty email should use contact_type no_email_found`);
    }

    if (email && contactType === "no_email_found") {
      errors.push(`Line ${line}: email is present but contact_type is no_email_found`);
    }

    if (checkedDate && !isValidDate(checkedDate)) {
      errors.push(`Line ${line}: source_checked_date must be YYYY-MM-DD`);
    }

    if (sourceUrl && !isHttpUrl(sourceUrl)) {
      errors.push(`Line ${line}: source_url must be an http(s) URL`);
    }

    const allowedNow = value(row, "email_marketing_allowed_now");
    if (allowedNow && !["No", "Yes"].includes(allowedNow)) {
      errors.push(`Line ${line}: email_marketing_allowed_now must be Yes or No`);
    }
  });

  if (errors.length > 0) {
    totalErrors += errors.length;
    console.error(`\n${file}: ${errors.length} error(s)`);
    for (const error of errors) console.error(`- ${error}`);
  } else {
    console.log(`${file}: ${dataRows.length} row(s) valid`);
  }
}

if (totalErrors > 0) {
  console.error(`\nLead validation failed: ${totalErrors} error(s) across ${totalRows} row(s).`);
  process.exit(1);
}

console.log(`Lead validation passed: ${totalRows} row(s).`);
