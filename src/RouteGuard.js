import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children, perm }) {
  const { asurite, isAdmin, perms, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!asurite) return <Navigate to="/login" replace />;
  if (perm && !perms[perm] && !isAdmin) return <Navigate to="/not-authorized" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { asurite, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!asurite) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/not-authorized" replace />;
  return children;
}
