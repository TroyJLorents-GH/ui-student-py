import React, { useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Tabs, Tab } from '@mui/material';
import { TERM_OPTIONS } from '../constants/terms';
import HiringTab from './analytics/HiringTab';
import EnrollmentTab from './analytics/EnrollmentTab';
import StudentPopulationTab from './analytics/StudentPopulationTab';
import OtherTab from './analytics/OtherTab';

export default function AdminAnalytics({ adminView = false }) {
  const [term, setTerm] = useState('current');
  const [tab, setTab] = useState(0);
  const termParam = term && term !== 'current' ? `?term=${term}` : '';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>SAMS Analytics</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Term</InputLabel>
          <Select value={term} label="Term" onChange={(e) => setTerm(e.target.value)}>
            {TERM_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Hiring / Staffing" />
        <Tab label="Enrollment" />
        <Tab label="Student Population" />
        <Tab label="Other" />
      </Tabs>

      {tab === 0 && <HiringTab termParam={termParam} />}
      {tab === 1 && <EnrollmentTab termParam={termParam} />}
      {tab === 2 && <StudentPopulationTab termParam={termParam} />}
      {tab === 3 && <OtherTab termParam={termParam} adminView={adminView} />}
    </Box>
  );
}
