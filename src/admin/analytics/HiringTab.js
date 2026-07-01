import React from 'react';
import { Box, Stack, Paper, Typography } from '@mui/material';
import ChartCard from './ChartCard';
import { useAnalytics } from './useAnalytics';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Kpi({ label, value }) {
  return (
    <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 180 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Paper>
  );
}

export default function HiringTab({ termParam }) {
  const kpis = useAnalytics(`/api/analytics/hiring/kpis${termParam}`, [termParam]);
  const byTerm = useAnalytics('/api/analytics/hiring/by-term', []);
  const comp = useAnalytics('/api/analytics/hiring/compensation-by-term', []);
  const byPos = useAnalytics(`/api/analytics/hiring/by-position${termParam}`, [termParam]);
  const topInstr = useAnalytics(`/api/analytics/hiring/top-instructors${termParam}`, [termParam]);
  const k = kpis.data || {};
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <Kpi label="Hires (term)" value={k.hires ?? '—'} />
        <Kpi label="Weekly hours" value={k.weeklyHours ?? '—'} />
        <Kpi label="Compensation" value={k.compensation != null ? currency.format(k.compensation) : '—'} />
        <Kpi label="Instructors staffed" value={k.instructors ?? '—'} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Hires by term (by position)" payload={byTerm.data} loading={byTerm.loading}
          error={byTerm.error} types={['bar-stacked', 'bar-grouped', 'line', 'area', 'heatmap']} />
        <ChartCard title="Compensation by term" payload={comp.data} loading={comp.loading}
          error={comp.error} types={['bar', 'line', 'area']} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Hires by position (term)" payload={byPos.data} loading={byPos.loading}
          error={byPos.error} types={['donut', 'bar', 'pie', 'radar']} />
        <ChartCard title="Top instructors by hires (term)" payload={topInstr.data} loading={topInstr.loading}
          error={topInstr.error} types={['bar-horizontal', 'scatter']} />
      </Stack>
    </Box>
  );
}
