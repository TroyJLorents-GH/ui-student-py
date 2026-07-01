import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const API = process.env.REACT_APP_API_URL || ""; 

export default function Login() {
  const { asurite, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const impersonate = async (id) => {
    setBusy(true);
    setErr('');
    try {
      // set cookie
      const r1 = await fetch(`${API}/api/dev-impersonate?asurite=${encodeURIComponent(id)}`, {
        credentials: 'include',
      });
      if (!r1.ok) throw new Error(await r1.text());

      // prime user (avoid any cache weirdness)
      await fetch(`${API}/api/user`, {
        credentials: 'include',
        cache: 'no-store',
      });

      // update context
      await refresh();

      // hard redirect so the app remounts with the new cookie
      window.location.replace('/');
    } catch (e) {
      setErr(e.message || 'Failed to impersonate');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    setErr('');
    try {
      await fetch(`${API}/api/dev-logout`, { credentials: 'include' });
      await refresh();
      window.location.replace('/login');
    } catch (e) {
      setErr(e.message || 'Failed to logout');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
      <div style={{ width: 420, padding: 24, borderRadius: 12, background: '#fff',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Sign In</h2>

        <p style={{ marginTop: -8, color: '#555' }}>
          {asurite ? <>Currently signed in as <b>{asurite}</b></> : <>You’re not signed in.</>}
        </p>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => impersonate('demo_faculty')}
            disabled={busy}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
              background: '#8c1d40', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            Login as Faculty
          </button>
          <button
            onClick={() => impersonate('demo_chair')}
            disabled={busy}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
              background: '#8c1d40', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            Login as Program Chair
          </button>
          <button
            onClick={() => impersonate('demo_admin')}
            disabled={busy}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
              background: '#8c1d40', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            Login as Admin
          </button>
          <button
            onClick={() => impersonate('demo_hr')}
            disabled={busy}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
              background: '#8c1d40', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            Login as HR
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={logout}
            disabled={busy}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fafafa', cursor: 'pointer' }}
          >
            Dev Logout
          </button>
        </div>

        {err && <div style={{ marginTop: 12, color: '#b00020', fontSize: 14 }}>{err}</div>}
      </div>
    </div>
  );
}
