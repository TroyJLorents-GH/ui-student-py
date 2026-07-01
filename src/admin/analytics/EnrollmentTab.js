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

// Level options for the course report — maps to backend career / CatalogNum-range params.
const LEVELS = [
  { value: 'all', label: 'All levels', params: '' },
  { value: 'ugrd', label: 'UGRD (undergrad 100–499)', params: '&cat_min=100&cat_max=499' },
  { value: '100', label: '100 level', params: '&cat_min=100&cat_max=199' },
  { value: '200', label: '200 level', params: '&cat_min=200&cat_max=299' },
  { value: '300', label: '300 level', params: '&cat_min=300&cat_max=399' },
  { value: '400', label: '400 level', params: '&cat_min=400&cat_max=499' },
  { value: 'grad', label: 'GRAD (graduate 500–799)', params: '&cat_min=500&cat_max=799' },
  { value: '500', label: '500 level', params: '&cat_min=500&cat_max=599' },
  { value: '600', label: '600 level', params: '&cat_min=600&cat_max=699' },
  { value: '700', label: '700 level', params: '&cat_min=700&cat_max=799' },
];

export default function EnrollmentTab({ termParam }) {
  const kpis = useAnalytics(`/api/analytics/enrollment/kpis${termParam}`, [termParam]);
  const bySubject = useAnalytics(`/api/analytics/enrollment/by-subject${termParam}`, [termParam]);
  const fillRate = useAnalytics(`/api/analytics/enrollment/fill-rate-by-subject${termParam}`, [termParam]);
  const topInstr = useAnalytics(`/api/analytics/enrollment/top-instructors${termParam}`, [termParam]);
  const modeMix = useAnalytics(`/api/analytics/enrollment/mode-mix${termParam}`, [termParam]);

  // ── Course report filters (cross-term; ignore the global term filter) ──
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('all');
  const subjects = useAnalytics('/api/analytics/enrollment/subjects', []);
  // Which Level options to show — only the hundreds this subject actually offers.
  const subjectLevels = useAnalytics(subject ? `/api/analytics/enrollment/levels?subject=${encodeURIComponent(subject)}` : null, [subject]);
  const availableLevels = (() => {
    const hundreds = subjectLevels.data;
    if (!subject || !hundreds) return LEVELS; // no subject picked → show all
    const has = (lo, hi) => hundreds.some((h) => h >= lo && h <= hi);
    return LEVELS.filter((l) => {
      if (l.value === 'all') return true;
      if (l.value === 'ugrd') return has(100, 400);
      if (l.value === 'grad') return has(500, 700);
      return hundreds.includes(Number(l.value)); // '100'..'700'
    });
  })();
  const levelParams = LEVELS.find((l) => l.value === level)?.params || '';
  const subjectParam = subject ? `&subject=${encodeURIComponent(subject)}` : '';
  const courseQuery = `${subjectParam}${levelParams}`;
  const courseEnroll = useAnalytics(
    `/api/analytics/enrollment/course-by-term?metric=enrollment${courseQuery}`, [courseQuery]);
  const courseFill = useAnalytics(
    `/api/analytics/enrollment/course-by-term?metric=fillrate${courseQuery}`, [courseQuery]);

  // ── Report A: course → instructor breakdown (pick subject + catalog) ──
  const [insSubject, setInsSubject] = useState('');
  const [insCatalog, setInsCatalog] = useState('');
  const catalogs = useAnalytics(
    insSubject ? `/api/analytics/enrollment/catalogs?subject=${encodeURIComponent(insSubject)}` : null,
    [insSubject]);
  const courseReady = insSubject && insCatalog !== '';
  const ciQuery = courseReady ? `?subject=${encodeURIComponent(insSubject)}&catalog=${insCatalog}` : null;
  const ciEnroll = useAnalytics(ciQuery ? `/api/analytics/enrollment/course-by-instructor${ciQuery}&metric=enrollment` : null, [ciQuery]);
  const ciFill = useAnalytics(ciQuery ? `/api/analytics/enrollment/course-by-instructor${ciQuery}&metric=fillrate` : null, [ciQuery]);

  // ── Report B: instructor load (pick instructor; uses the global term filter) ──
  const [instructorId, setInstructorId] = useState('');
  const instructors = useAnalytics('/api/analytics/enrollment/instructors', []);
  const loadQuery = instructorId
    ? `?instructor_id=${instructorId}${termParam ? `&${termParam.slice(1)}` : ''}` : null;
  const instrLoad = useAnalytics(loadQuery ? `/api/analytics/enrollment/instructor-load${loadQuery}` : null, [loadQuery]);
  // Total fill across the instructor's classes (Enrolled vs Capacity series)
  const loadTotal = (() => {
    const s = instrLoad.data?.series;
    if (!s || s.length < 2) return null;
    const enr = s[0].data.reduce((a, b) => a + b, 0);
    const cap = s[1].data.reduce((a, b) => a + b, 0);
    return { enr, cap, pct: cap ? Math.round((100 * enr) / cap) : 0 };
  })();

  const k = kpis.data || {};
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <Kpi label="Enrollment (term)" value={k.enrollment ?? '—'} />
        <Kpi label="Sections" value={k.sections ?? '—'} />
        <Kpi label="Fill rate" value={k.fillRate != null ? `${k.fillRate}%` : '—'} />
        <Kpi label="Instructors" value={k.instructors ?? '—'} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Enrollment by subject" payload={bySubject.data} loading={bySubject.loading}
          error={bySubject.error} types={['bar', 'donut', 'line']} />
        <ChartCard title="Fill rate by subject" payload={fillRate.data} loading={fillRate.loading}
          error={fillRate.error} types={['bar', 'line']} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <ChartCard title="Top instructors by enrollment" payload={topInstr.data} loading={topInstr.loading}
          error={topInstr.error} types={['bar-horizontal', 'scatter']} />
        <ChartCard title="Instruction mode mix" payload={modeMix.data} loading={modeMix.loading}
          error={modeMix.error} types={['donut', 'pie', 'bar']} />
      </Stack>

      {/* ── Cross-term course report + filters ── */}
      <Typography variant="body2" sx={{ display: 'block', mt: 3, color: 'text.primary' }}>
        Big picture: the top 25 courses by total enrollment for the chosen subject/level (all sections combined),
        shown across terms. Spot which courses run consistently hot or cold to plan capacity (e.g. add a section).
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Course trends across terms (top 25)
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Subject</InputLabel>
          <Select value={subject} label="Subject"
            onChange={(e) => { setSubject(e.target.value); setLevel('all'); }}>
            <MenuItem value="">All subjects</MenuItem>
            {(subjects.data || []).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Level</InputLabel>
          <Select value={level} label="Level" onChange={(e) => setLevel(e.target.value)}>
            {availableLevels.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Stack direction="column" spacing={2}>
        <ChartCard title="Enrollment by course × term" payload={courseEnroll.data} loading={courseEnroll.loading}
          error={courseEnroll.error} types={['heatmap', 'bar-horizontal', 'line']} />
        <ChartCard title="Fill % by course × term" payload={courseFill.data} loading={courseFill.loading}
          error={courseFill.error} types={['heatmap', 'bar-horizontal', 'line']} />
      </Stack>

      {/* ── Report A: course → instructor breakdown ── */}
      <Typography variant="body2" sx={{ display: 'block', mt: 3, color: 'text.primary' }}>
        Drill into one course: compare each instructor’s enrolled count and fill % across terms — see if a
        specific instructor’s section consistently under-fills vs another’s.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Course by instructor (fill across terms)
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Subject</InputLabel>
          <Select value={insSubject} label="Subject"
            onChange={(e) => { setInsSubject(e.target.value); setInsCatalog(''); }}>
            <MenuItem value="">—</MenuItem>
            {(subjects.data || []).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }} disabled={!insSubject}>
          <InputLabel>Catalog #</InputLabel>
          <Select value={insCatalog} label="Catalog #" onChange={(e) => setInsCatalog(e.target.value)}>
            <MenuItem value="">—</MenuItem>
            {(catalogs.data || []).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      {courseReady ? (
        <Stack direction="column" spacing={2}>
          <ChartCard title={`${insSubject} ${insCatalog} — enrolled by instructor × term`}
            payload={ciEnroll.data} loading={ciEnroll.loading} error={ciEnroll.error}
            types={['bar-grouped', 'bar-horizontal', 'heatmap']} />
          <ChartCard title={`${insSubject} ${insCatalog} — fill % by instructor × term`}
            payload={ciFill.data} loading={ciFill.loading} error={ciFill.error}
            types={['bar-grouped', 'bar-horizontal', 'heatmap']} />
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Pick a subject and catalog number to see each instructor’s fill.
        </Typography>
      )}

      {/* ── Report B: instructor load ── */}
      <Typography variant="body2" sx={{ display: 'block', mt: 3, color: 'text.primary' }}>
        Drill into one instructor: all the classes they teach in the selected term, enrolled vs capacity per
        class, with their total fill — to judge overall load and where to add or shift sections.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Instructor load (selected term)
        </Typography>
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Instructor</InputLabel>
          <Select value={instructorId} label="Instructor" onChange={(e) => setInstructorId(e.target.value)}>
            <MenuItem value="">—</MenuItem>
            {(instructors.data || []).map((i) => (
              <MenuItem key={i.id} value={i.id}>{`${i.name} (${i.id})`}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {loadTotal && (
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Total: {loadTotal.enr}/{loadTotal.cap} ({loadTotal.pct}%)
          </Typography>
        )}
      </Box>
      {instructorId ? (
        <ChartCard title="Enrolled vs capacity by class" payload={instrLoad.data}
          loading={instrLoad.loading} error={instrLoad.error}
          types={['bar-grouped', 'bar-horizontal']} />
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Pick an instructor to see all their classes and total fill for the selected term.
        </Typography>
      )}
    </Box>
  );
}
