// Developmental domains used to tag IEP goals and pack focus areas.
import type { GoalStatus, UpdateType } from "./types";

export interface DomainMeta {
  key: string;
  label: string;
}

export const DOMAINS: DomainMeta[] = [
  { key: "communication", label: "Communication & Language" },
  { key: "fine_motor", label: "Fine Motor" },
  { key: "gross_motor", label: "Gross Motor" },
  { key: "social_emotional", label: "Social & Emotional" },
  { key: "cognitive", label: "Cognitive" },
  { key: "self_care", label: "Self-Care / Daily Living" },
  { key: "sensory", label: "Sensory & Regulation" },
  { key: "literacy", label: "Literacy" },
  { key: "numeracy", label: "Numeracy" },
  { key: "behaviour", label: "Behaviour" },
];

const DOMAIN_LABELS = Object.fromEntries(DOMAINS.map((d) => [d.key, d.label]));

export const domainLabel = (key: string): string =>
  DOMAIN_LABELS[key] ?? key.replace(/_/g, " ");

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: "Not started",
  emerging: "Emerging",
  developing: "Developing",
  achieved: "Achieved",
  on_hold: "On hold",
};

export const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  progress: "Progress note",
  therapy_note: "Therapy note",
  announcement: "Announcement",
};

// Below this, a goal's domain is considered "lagging" and eligible for pack
// suggestions. Also used to colour progress bars.
export const LAGGING_THRESHOLD = 60;
