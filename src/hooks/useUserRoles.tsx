import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "moderator" | "client" | "pro";

interface UserRolesState {
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
}

const DEFAULT: UserRolesState = { loading: true, roles: [], isAdmin: false };

export function useUserRoles(): UserRolesState {
  const { user } = useAuth();
  const [state, setState] = useState<UserRolesState>(DEFAULT);

  useEffect(() => {
    if (!user) { setState({ ...DEFAULT, loading: false }); return; }
    (async () => {
      // Read roles through a SECURITY DEFINER RPC. Selecting user_roles
      // directly is blocked by a RESTRICTIVE "admins only" policy that
      // covers SELECT as well as writes, so the table read comes back
      // empty and silently strips a real admin of their role.
      const { data, error } = await supabase.rpc("current_user_roles");
      if (error) {
        console.error("Could not load user roles", error);
        setState({ ...DEFAULT, loading: false });
        return;
      }
      const roles = ((data ?? []) as unknown[]).map((r) =>
        (typeof r === "string" ? r : (r as { role?: string })?.role) as AppRole,
      ).filter(Boolean);
      setState({
        loading: false,
        roles,
        isAdmin: roles.includes("admin"),
      });
    })();
  }, [user]);

  return state;
}
