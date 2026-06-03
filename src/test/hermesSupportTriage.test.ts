import { describe, expect, it } from "vitest";

import { triageSupportMessage } from "../../scripts/hermes-support-triage";

describe("Hermes support triage", () => {
  it("quarantines obvious SEO spam", () => {
    const result = triageSupportMessage({
      id: "spam-1",
      channel: "email",
      from: "pitch@example.com",
      subject: "Guest post backlink proposal",
      body: "Dear website owner, we can improve your domain authority with link insertion and backlinks.",
    });

    expect(result.priority).toBe("spam");
    expect(result.bucket).toBe("spam");
    expect(result.escalation).toMatch(/quarantine|ignore/);
    expect(result.suggested_reply).toBeNull();
  });

  it("escalates payment problems to Maxine", () => {
    const result = triageSupportMessage({
      id: "pay-1",
      channel: "email",
      from: "pro@example.co.za",
      subject: "PayFast charged me but account is locked",
      body: "I paid R250 but the dashboard still says I need a plan.",
    });

    expect(result.bucket).toBe("payment_billing");
    expect(result.priority).toBe("p1");
    expect(result.escalation).toBe("maxine_now");
    expect(result.suggested_reply).toContain("checking the payment record");
  });

  it("routes quote flow bugs to Codex", () => {
    const result = triageSupportMessage({
      id: "quote-1",
      channel: "whatsapp",
      from: "+27000000000",
      body: "The quote won't send when I apply for an urgent job.",
    });

    expect(result.bucket).toBe("quote_job_flow");
    expect(result.escalation).toBe("codex_bugfix");
  });
});
