import React, { createContext, useContext, useEffect, useState } from "react";

const API = process.env.REACT_APP_API_BASE || "";

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

    const loadUser = async () => {
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

    loadUser();
    return () => { cancelled = true; };
  }, []);

  const login = () => {
    window.location.assign("/login");
  };

  const logout = async () => {
    try {
      await fetch(`${API}/api/dev-logout`, { credentials: "include" });
      setFromUserObj(null);
      window.location.assign("/login");
    } catch {
      setFromUserObj(null);
      window.location.assign("/login");
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user`, { credentials: "include" });
      setFromUserObj(res.ok ? await res.json() : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ asurite, isAdmin, role, perms, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
