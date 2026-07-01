// src/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "./utils/apiClient";

const API = process.env.REACT_APP_API_URL || "";
const USE_CAS = String(process.env.REACT_APP_USE_CAS || "false").toLowerCase() === "true";
const USE_MOCK = String(process.env.REACT_APP_USE_MOCK_AUTH || "false").toLowerCase() === "true";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [asurite, setAsurite] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(null);
  const [perms, setPerms] = useState({});
  const [loading, setLoading] = useState(true);

  const setFromUserObj = (data) => {
    setAsurite(data?.asurite || null);
    setIsAdmin(!!data?.is_admin);
    setRole(data?.role || null);
    setPerms(data?.perms || {});
  };

  useEffect(() => {
    let cancelled = false;

    const loadMock = async () => {
      if (cancelled) return;
      setAsurite("tlorents");
      setIsAdmin(true);
      setRole("admin");
      setPerms({
        assignment_adder: true,
        applications: true,
        student_summary_page: true,
        bulk_upload_assignments: true,
        manage_assignments: true,
        login: true,
        master_dashboard: true,
        faculty_dashboard: true,
        analytics: true,
        chat: true,
        is_admin: true,
      });
      setLoading(false);
    };

    const loadCAS = async () => {
      try {
        const me = await apiFetch("/api/secure/whoami");
        if (!cancelled) setFromUserObj(me || null);
      } catch {
        if (!cancelled) setFromUserObj(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadDev = async () => {
      try {
        const res = await fetch(`${API}/api/user`, { credentials: "include" });
        if (!cancelled) {
          if (!res.ok) setFromUserObj(null);
          else setFromUserObj(await res.json());
        }
      } catch {
        if (!cancelled) setFromUserObj(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (USE_MOCK) loadMock();
    else if (USE_CAS) loadCAS();
    else loadDev();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = () => {
    window.location.assign(USE_CAS ? "/auth/login" : "/login");
  };

  const logout = async () => {
    try {
      if (USE_CAS) {
        const response = await apiFetch("/auth/logout", { method: "POST" });
        setFromUserObj(null);
        // If backend returns a CAS logout URL, navigate to it
        if (response?.redirect) {
          window.location.href = response.redirect;
        } else {
          window.location.assign("/");
        }
      } else {
        await fetch(`${API}/api/dev-logout`, { credentials: "include" });
        setFromUserObj(null);
        window.location.assign("/login");
      }
    } catch {
      setFromUserObj(null);
      window.location.assign(USE_CAS ? "/" : "/login");
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      if (USE_CAS) {
        const me = await apiFetch("/api/secure/whoami");
        setFromUserObj(me);
      } else {
        const res = await fetch(`${API}/api/user`, { credentials: "include" });
        setFromUserObj(res.ok ? await res.json() : null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ asurite, isAdmin, role, perms, loading, login, logout, refresh, USE_CAS, USE_MOCK }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
