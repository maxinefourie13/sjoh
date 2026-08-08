// Domain types for the Piece of Mind Care & Progress Portal.
// These mirror the `school_*` tables. The Supabase client is typed against the
// auto-generated Database (which does not yet include these tables), so the data
// layer casts through an untyped client and returns these shapes.

export type SchoolRole = "school_admin" | "therapist" | "parent";

export type ChildStatus = "active" | "inactive" | "archived";

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  avatar_url: string | null;
  diagnosis: string | null;
  notes: string | null;
  status: ChildStatus;
  created_at: string;
  updated_at: string;
}

export type Relationship = "parent" | "therapist";

export interface ChildAccess {
  id: string;
  child_id: string;
  user_id: string;
  relationship: Relationship;
  created_at: string;
}

export type IepStatus = "draft" | "active" | "archived";

export interface Iep {
  id: string;
  child_id: string;
  title: string;
  summary: string | null;
  start_date: string;
  review_date: string | null;
  status: IepStatus;
  created_at: string;
  updated_at: string;
}

export type GoalStatus =
  | "not_started"
  | "emerging"
  | "developing"
  | "achieved"
  | "on_hold";

export interface Goal {
  id: string;
  iep_id: string;
  child_id: string;
  domain: string;
  title: string;
  description: string | null;
  baseline: string | null;
  target: string | null;
  status: GoalStatus;
  progress: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type UpdateType = "progress" | "therapy_note" | "announcement";

export interface ChildUpdate {
  id: string;
  child_id: string;
  author_id: string | null;
  type: UpdateType;
  title: string;
  body: string;
  created_at: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  focus_areas: string[];
  age_min: number | null;
  age_max: number | null;
  url: string | null;
  image_url: string | null;
  active: boolean;
}

export type RecommendationStatus = "suggested" | "purchased" | "dismissed";
export type RecommendationSource = "auto" | "manual";

export interface PackRecommendation {
  id: string;
  child_id: string;
  pack_id: string;
  reason: string | null;
  source: RecommendationSource;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
  pack?: Pack;
}

export interface ChildReport {
  id: string;
  child_id: string;
  period_start: string | null;
  period_end: string | null;
  summary: string | null;
  generated_by: string | null;
  created_at: string;
}
