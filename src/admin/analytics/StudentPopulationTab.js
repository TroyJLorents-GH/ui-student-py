import React, { useState } from 'react';
import { Box, Stack, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ChartCard from './ChartCard';
import { useAnalytics } from './useAnalytics';

function Kpi({ label, value }) {
  return (
    <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 180 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Paper>
  );
}

const DEGREES = [
  { value: 'PHD', label: 'PhD' },
  { value: 'MS', label: 'MS (Masters)' },
  { value: 'BS', label: 'BS (Bachelors)' },
];

export default function StudentPopulationTab({ termParam }) {
  const kpis = useAnalytics(`/api/analytics/students/kpis${termParam}`, [termParam]);
  const byDegree = useAnalytics(`/api/analytics/students/by-degree${termParam}`, [termParam]);
  const byOrg = useAnalytics(`/api/analytics/students/by-org${termParam}`, [termParam]);
  const byCampus = useAnalytics(`/api/analytics/students/by-campus${termParam}`, [termParam]);

  // Plan card: pick the degree level (PhD/MS/BS)
  const [planDegree, setPlanDegree] = useState('PHD');
  const byPlan = useAnalytics(`/api/analytics/students/by-plan?degree=${planDegree}`, [planDegree]);
  const planLabel = DEGREES.find((d) => d.value === planDegree)?.label || planDegree;

  const k = kpis.data || {};
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <Kpi label="Total students" value={k.total ?? '—'} />
        <Kpi label="PhD" value={k.phd ?? '—'} />
        <Kpi label="MS" value={k.ms ?? '—'} />
        <Kpi label="BS" value={k.bs ?? '—'} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Headcount by degree" payload={byDegree.data} loading={byDegree.loading}
          error={byDegree.error} types={['donut', 'bar', 'pie']} />
        <ChartCard title="Students by academic org" payload={byOrg.data} loading={byOrg.loading}
          error={byOrg.error} types={['bar', 'donut']} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 360 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Degree level</InputLabel>
              <Select value={planDegree} label="Degree level" onChange={(e) => setPlanDegree(e.target.value)}>
                {DEGREES.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <ChartCard title={`${planLabel} students by plan`} payload={byPlan.data} loading={byPlan.loading}
            error={byPlan.error} types={['bar-horizontal']} />
        </Box>
        <ChartCard title="Students by campus" payload={byCampus.data} loading={byCampus.loading}
          error={byCampus.error} types={['donut', 'bar', 'pie']} />
      </Stack>
    </Box>
  );
}
