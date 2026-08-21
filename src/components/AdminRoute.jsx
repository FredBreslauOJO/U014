import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useIsAdmin } from "@/lib/useIsAdmin";

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#606060]">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
