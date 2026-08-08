// Data-access + React Query hooks for the school module.
// The generated Supabase Database type does not yet include the school_* tables,
// so we go through an untyped view of the client and cast results to our domain
// types (defined in ./types).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  Child,
  ChildAccess,
  ChildReport,
  ChildUpdate,
  Goal,
  Iep,
  Pack,
  PackRecommendation,
  Relationship,
  SchoolRole,
} from "./types";

// Untyped client view — school_* tables aren't in the generated Database type.
const db = supabase as any;

// --------------------------------------------------------------------------
// Roles
// --------------------------------------------------------------------------
export function useSchoolRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school", "roles", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SchoolRole[]> => {
      const { data, error } = await db
        .from("school_user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r: { role: SchoolRole }) => r.role);
    },
  });
}

export function useIsSchoolMember() {
  const { data: roles = [], isLoading } = useSchoolRoles();
  return {
    loading: isLoading,
    roles,
    isAdmin: roles.includes("school_admin"),
    isTherapist: roles.includes("therapist"),
    isParent: roles.includes("parent"),
    isStaff: roles.includes("school_admin") || roles.includes("therapist"),
    isMember: roles.length > 0,
  };
}

// --------------------------------------------------------------------------
// Children (RLS scopes automatically to what the user may see)
// --------------------------------------------------------------------------
export function useMyChildren() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school", "children", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Child[]> => {
      const { data, error } = await db
        .from("school_children")
        .select("*")
        .neq("status", "archived")
        .order("first_name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useChild(childId: string | undefined) {
  return useQuery({
    queryKey: ["school", "child", childId],
    enabled: !!childId,
    queryFn: async (): Promise<Child | null> => {
      const { data, error } = await db
        .from("school_children")
        .select("*")
        .eq("id", childId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateChild() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Child> & { first_name: string; last_name: string }) => {
      const { data, error } = await db
        .from("school_children")
        .insert({ ...input, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "children"] }),
  });
}

// --------------------------------------------------------------------------
// Access links (admin)
// --------------------------------------------------------------------------
export function useChildAccess(childId: string | undefined) {
  return useQuery({
    queryKey: ["school", "access", childId],
    enabled: !!childId,
    queryFn: async (): Promise<ChildAccess[]> => {
      const { data, error } = await db
        .from("school_child_access")
        .select("*")
        .eq("child_id", childId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLinkUserToChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { child_id: string; user_id: string; relationship: Relationship }) => {
      const { error } = await db.from("school_child_access").insert(input);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["school", "access", v.child_id] });
      qc.invalidateQueries({ queryKey: ["school", "children"] });
    },
  });
}

// --------------------------------------------------------------------------
// IEP + goals
// --------------------------------------------------------------------------
export function useIep(childId: string | undefined) {
  return useQuery({
    queryKey: ["school", "iep", childId],
    enabled: !!childId,
    queryFn: async (): Promise<Iep | null> => {
      const { data, error } = await db
        .from("school_ieps")
        .select("*")
        .eq("child_id", childId)
        .neq("status", "archived")
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useEnsureIep() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (childId: string): Promise<Iep> => {
      const { data: existing } = await db
        .from("school_ieps")
        .select("*")
        .eq("child_id", childId)
        .neq("status", "archived")
        .maybeSingle();
      if (existing) return existing as Iep;
      const { data, error } = await db
        .from("school_ieps")
        .insert({ child_id: childId, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as Iep;
    },
    onSuccess: (_d, childId) => qc.invalidateQueries({ queryKey: ["school", "iep", childId] }),
  });
}

export function useGoals(childId: string | undefined) {
  return useQuery({
    queryKey: ["school", "goals", childId],
    enabled: !!childId,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await db
        .from("school_iep_goals")
        .select("*")
        .eq("child_id", childId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertGoal(childId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (goal: Partial<Goal> & { iep_id: string; domain: string; title: string }) => {
      const payload = { ...goal, child_id: childId, created_by: user?.id };
      const { error } = goal.id
        ? await db.from("school_iep_goals").update(payload).eq("id", goal.id)
        : await db.from("school_iep_goals").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "goals", childId] }),
  });
}

export function useUpdateGoalProgress(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; progress: number; status?: Goal["status"] }) => {
      const { error } = await db
        .from("school_iep_goals")
        .update({ progress: input.progress, ...(input.status ? { status: input.status } : {}) })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "goals", childId] }),
  });
}

// --------------------------------------------------------------------------
// Updates / therapy notes
// --------------------------------------------------------------------------
export function useUpdates(childId: string | undefined) {
  return useQuery({
    queryKey: ["school", "updates", childId],
    enabled: !!childId,
    queryFn: async (): Promise<ChildUpdate[]> => {
      const { data, error } = await db
        .from("school_updates")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddUpdate(childId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Pick<ChildUpdate, "type" | "title" | "body">) => {
      const { error } = await db
        .from("school_updates")
        .insert({ ...input, child_id: childId, author_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "updates", childId] }),
  });
}

// --------------------------------------------------------------------------
// Packs + recommendations
// --------------------------------------------------------------------------
export function usePacks() {
  return useQuery({
    queryKey: ["school", "packs"],
    queryFn: async (): Promise<Pack[]> => {
      const { data, error } = await db
        .from("school_packs")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecommendations(childId: string | undefined) {
  return useQuery({
    queryKey: ["school", "recs", childId],
    enabled: !!childId,
    queryFn: async (): Promise<PackRecommendation[]> => {
      const { data, error } = await db
        .from("school_pack_recommendations")
        .select("*, pack:school_packs(*)")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecommendPack(childId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { pack_id: string; reason: string; source?: "auto" | "manual" }) => {
      const { error } = await db.from("school_pack_recommendations").insert({
        child_id: childId,
        pack_id: input.pack_id,
        reason: input.reason,
        source: input.source ?? "manual",
        recommended_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "recs", childId] }),
  });
}

export function useSetRecommendationStatus(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: PackRecommendation["status"] }) => {
      const { error } = await db
        .from("school_pack_recommendations")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "recs", childId] }),
  });
}

export function useCreatePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Pack> & { name: string }) => {
      const { error } = await db.from("school_packs").insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "packs"] }),
  });
}

// --------------------------------------------------------------------------
// Admin: link a parent/therapist to a child by email (security-definer RPC)
// --------------------------------------------------------------------------
export function useLinkGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { child_id: string; email: string; relationship: Relationship }) => {
      const { data, error } = await db.rpc("school_link_guardian", {
        _child_id: input.child_id,
        _email: input.email,
        _relationship: input.relationship,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["school", "access", v.child_id] });
      qc.invalidateQueries({ queryKey: ["school", "children"] });
    },
  });
}

// --------------------------------------------------------------------------
// Reports
// --------------------------------------------------------------------------
export function useLogReport(childId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<ChildReport>) => {
      const { error } = await db
        .from("school_reports")
        .insert({ ...input, child_id: childId, generated_by: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school", "reports", childId] }),
  });
}
