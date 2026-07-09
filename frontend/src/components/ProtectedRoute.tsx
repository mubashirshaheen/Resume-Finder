import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading...</div>;
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
