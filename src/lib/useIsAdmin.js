import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        setRole(!error && data ? data.role : null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin: !loading && role === "admin", role, loading: authLoading || loading };
}
