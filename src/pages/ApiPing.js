import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

const baseUrl = process.env.REACT_APP_API_BASE;

export default function ApiPing() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const ping = async () => {
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${baseUrl}/api/ping`, { credentials: 'include' });
      const text = await res.text();
      setResult(text);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>API Connectivity Test</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Base URL: {baseUrl || '(not set)'}
        </Typography>
        <Button variant="contained" onClick={ping}>Ping Backend</Button>
        {result && <Typography sx={{ mt: 2, color: 'green' }}>Response: {result}</Typography>}
        {error && <Typography sx={{ mt: 2, color: 'red' }}>Error: {error}</Typography>}
      </Paper>
    </Box>
  );
}
