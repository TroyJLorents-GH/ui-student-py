import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ALLOWED = ['troy.lorents@asu.edu','joe.caudill@asu.edu', 't@me.com'];
const PW = 'test123';

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
  error: { color: 'red' }
};
