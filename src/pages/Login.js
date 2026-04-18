import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../AuthContext';

const baseUrl = process.env.REACT_APP_API_BASE;

export default function Login() {
  const [asurite, setAsurite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/dev-impersonate?asurite=${encodeURIComponent(asurite)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Login failed');
      await refresh();
      nav('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Dev Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter an Employee ID to impersonate a user. This user must exist in the user_access table.
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Portfolio demo:</strong> use <code>jdoe</code> to login.
        </Alert>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Employee ID"
            value={asurite}
            onChange={e => setAsurite(e.target.value)}
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
            placeholder="e.g. johndoe"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!asurite.trim() || loading}
          >
            {loading ? 'Logging in...' : 'Impersonate'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
