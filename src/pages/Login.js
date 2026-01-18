import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ALLOWED = (process.env.REACT_APP_ALLOWED_EMAILS || '').split(',');
const PW =  process.env.REACT_APP_MASTER_PASSWORD;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    if (!ALLOWED.includes(email.toLowerCase())) {
      setError('This email is not authorized.');
      return;
    }
    if (pw !== PW) {
      setError('Wrong password.');
      return;
    }
    onLogin();
    nav('/dashboard', { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Login</h2>
      <div style={styles.demoCredentials}>
        <p style={styles.demoTitle}>Demo Credentials</p>
        <p style={styles.demoText}>Email: t@me.com</p>
        <p style={styles.demoText}>Password: test123</p>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.field}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />
      </div>
      <div style={styles.field}>
        <label>Password</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          required
          style={styles.input}
        />
      </div>
      <button type="submit" style={styles.button}>Log In</button>
    </form>
  );
}

const styles = {
  form: { maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
  field: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  input: { padding: '8px', fontSize: '1rem' },
  button: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red' },
  demoCredentials: { backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #90caf9' },
  demoTitle: { fontWeight: 'bold', marginBottom: '8px', marginTop: 0, color: '#1565c0' },
  demoText: { margin: '4px 0', fontFamily: 'monospace', fontSize: '0.95rem' }
};