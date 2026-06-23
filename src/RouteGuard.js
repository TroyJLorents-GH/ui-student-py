// src/RouteGuard.js
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }) {
  const { asurite, loading, USE_CAS } = useAuth();

  useEffect(() => {
    if (!loading && !asurite && USE_CAS) {
      // Force full page redirect to backend for CAS
      window.location.href = "/auth/login";
    }
  }, [loading, asurite, USE_CAS]);

  if (loading) return <div>Loading…</div>;
  if (!asurite) {
    if (USE_CAS) return <div>Redirecting to login...</div>;
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { asurite, isAdmin, loading, USE_CAS } = useAuth();

  useEffect(() => {
    if (!loading && !asurite && USE_CAS) {
      // Force full page redirect to backend for CAS
      window.location.href = "/auth/login";
    }
  }, [loading, asurite, USE_CAS]);

  if (loading) return <div>Loading…</div>;
  if (!asurite) {
    if (USE_CAS) return <div>Redirecting to login...</div>;
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) return <Navigate to="/not-authorized" replace />;
  return children;
}
