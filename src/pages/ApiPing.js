import React, { useState } from 'react';
const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function ApiPing() {
  const [out, setOut] = useState('');

  const doPing = async () => {
    try {
      const r = await fetch(`${API}/api/ping`, { credentials: 'include' });
      const txt = await r.text();
      setOut(`Status: ${r.status}, Body: ${txt}`);
    } catch (e) {
      setOut(`Error: ${String(e)}`);
    }
  };

  const getUser = async () => {
    try {
      const r = await fetch(`${API}/api/user`, { credentials: 'include' });
      const js = await r.json();
      setOut(`Status: ${r.status}, JSON: ${JSON.stringify(js)}`);
    } catch (e) {
      setOut(`Error: ${String(e)}`);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h3>API Connectivity Test</h3>
      <button onClick={doPing}>Ping</button>{' '}
      <button onClick={getUser}>/api/user</button>
      <pre>{out}</pre>
      <p><a href={`${API}/api/dev-login-no-redirect`}>Set cookie (no redirect)</a></p>
    </div>
  );
}
