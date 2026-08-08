import { describe, expect, it } from "vitest";
import {
  laggingDomains,
  suggestPacks,
  overallProgress,
  reasonFor,
} from "@/features/school/packLogic";
import type { Goal, Pack } from "@/features/school/types";

const goal = (over: Partial<Goal>): Goal => ({
  id: crypto.randomUUID(),
  iep_id: "iep",
  child_id: "child",
  domain: "communication",
  title: "goal",
  description: null,
  baseline: null,
  target: null,
  status: "developing",
  progress: 50,
  sort_order: 0,
  created_at: "",
  updated_at: "",
  ...over,
});

const pack = (over: Partial<Pack>): Pack => ({
  id: crypto.randomUUID(),
  name: "pack",
  description: null,
  price_cents: 10000,
  currency: "ZAR",
  focus_areas: [],
  age_min: null,
  age_max: null,
  url: null,
  image_url: null,
  active: true,
  ...over,
});

describe("laggingDomains", () => {
  it("flags domains below threshold or emerging/not_started", () => {
    const goals = [
      goal({ domain: "communication", progress: 40 }),
      goal({ domain: "fine_motor", progress: 90, status: "developing" }),
      goal({ domain: "sensory", progress: 80, status: "emerging" }),
    ];
    const lagging = laggingDomains(goals);
    expect(lagging).toContain("communication");
    expect(lagging).toContain("sensory");
    expect(lagging).not.toContain("fine_motor");
  });

  it("ignores achieved goals", () => {
    const goals = [goal({ domain: "numeracy", progress: 10, status: "achieved" })];
    expect(laggingDomains(goals)).toEqual([]);
  });
});

describe("suggestPacks", () => {
  const goals = [
    goal({ domain: "communication", progress: 30 }),
    goal({ domain: "fine_motor", progress: 20 }),
  ];
  const packs = [
    pack({ id: "p1", name: "Language", focus_areas: ["communication"] }),
    pack({ id: "p2", name: "Motor", focus_areas: ["fine_motor", "gross_motor"] }),
    pack({ id: "p3", name: "Combo", focus_areas: ["communication", "fine_motor"] }),
    pack({ id: "p4", name: "Numeracy", focus_areas: ["numeracy"] }),
  ];

  it("suggests only packs matching lagging domains", () => {
    const out = suggestPacks(goals, packs, new Set());
    const names = out.map((s) => s.pack.name);
    expect(names).toContain("Language");
    expect(names).toContain("Combo");
    expect(names).not.toContain("Numeracy");
  });

  it("ranks packs matching more lagging domains first", () => {
    const out = suggestPacks(goals, packs, new Set());
    expect(out[0].pack.name).toBe("Combo");
  });

  it("excludes already-recommended packs", () => {
    const out = suggestPacks(goals, packs, new Set(["p3"]));
    expect(out.map((s) => s.pack.name)).not.toContain("Combo");
  });

  it("returns nothing when no domains are lagging", () => {
    const strong = [goal({ domain: "communication", progress: 95, status: "developing" })];
    expect(suggestPacks(strong, packs, new Set())).toEqual([]);
  });

  it("skips inactive packs", () => {
    const out = suggestPacks(goals, [pack({ name: "Off", focus_areas: ["communication"], active: false })], new Set());
    expect(out).toEqual([]);
  });
});

describe("overallProgress", () => {
  it("averages goal progress", () => {
    expect(overallProgress([goal({ progress: 20 }), goal({ progress: 40 })])).toBe(30);
  });
  it("is 0 with no goals", () => {
    expect(overallProgress([])).toBe(0);
  });
});

describe("reasonFor", () => {
  it("reads naturally for one domain", () => {
    expect(reasonFor(["communication"])).toContain("Communication & Language");
  });
  it("joins multiple domains", () => {
    expect(reasonFor(["communication", "fine_motor"])).toMatch(/ and /);
  });
});
