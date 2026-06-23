import React, { useState } from 'react';
import { Paper, Box, Typography, Select, MenuItem, CircularProgress, Chip } from '@mui/material';
import { renderChart, TYPE_LABELS } from './chartRenderers';

export default function ChartCard({ title, payload, loading, error, types = ['bar'], defaultType }) {
  const [type, setType] = useState(defaultType || types[0]);
  return (
    <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 360 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        {types.length > 1 && (
          <Select size="small" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 140 }}>
            {types.map((t) => <MenuItem key={t} value={t}>{TYPE_LABELS[t] || t}</MenuItem>)}
          </Select>
        )}
      </Box>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
      {!loading && error && <Chip color="error" variant="outlined" label={error} size="small" />}
      {!loading && !error && (renderChart(type, payload) || (
        <Typography variant="body2" sx={{ color: 'text.secondary', p: 4, textAlign: 'center' }}>
          No data to display
        </Typography>
      ))}
    </Paper>
  );
}
