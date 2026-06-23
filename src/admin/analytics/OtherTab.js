import React from 'react';
import { Box, Stack, Paper, Typography } from '@mui/material';
import ChartCard from './ChartCard';
import { useAnalytics } from './useAnalytics';

export default function OtherTab({ termParam, adminView = false }) {
  const ratio = useAnalytics(`/api/analytics/cross/grader-ratio-by-subject${termParam}`, [termParam]);
  const cost = useAnalytics(`/api/analytics/cross/cost-per-enrolled-by-subject${termParam}`, [termParam]);
  const pipeline = useAnalytics(`/api/analytics/cross/offer-pipeline${termParam}`, [termParam]);
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Student-to-grader ratio by subject" payload={ratio.data} loading={ratio.loading}
          error={ratio.error} types={['bar-grouped', 'line']} />
        <ChartCard title="Cost per enrolled student by subject" payload={cost.data} loading={cost.loading}
          error={cost.error} types={['bar', 'line']} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Offer pipeline (term)" payload={pipeline.data} loading={pipeline.loading}
          error={pipeline.error} types={['funnel', 'bar']} />
        {adminView && (
          <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Admin-only metrics — add admin-restricted charts here.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
