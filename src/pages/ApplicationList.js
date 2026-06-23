import React, { useEffect, useMemo, useState } from 'react';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { CustomToolbarWithPivot, getDataGridSx } from '../utils/dataGridStyles';

const baseUrl = process.env.REACT_APP_API_URL;
if (!baseUrl) console.error("REACT_APP_API_URL is not defined.");

const ENDPOINTS = {
  Masters: `${baseUrl}/api/MastersApplication`,
  PhD: `${baseUrl}/api/PhdApplication`,
};

export default function ApplicationList() {
  const theme = useTheme();
  const dataGridSx = useMemo(() => getDataGridSx(theme), [theme]);

  const [appType, setAppType] = useState('Masters'); // 'Masters' | 'PhD'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [columnState, setColumnState] = useState({});
  const [gridKey, setGridKey] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 50, page: 0 });

  // Reset columns to default widths
  const handleResetColumns = () => {
    setColumnState({});
    setGridKey(prev => prev + 1); // Force DataGrid to remount
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Application term — decoupled from .env ACTIVE_TERM so faculty only see
        // the current recruiting term. Bump this when the next term goes live.
        const r = await fetch(`${ENDPOINTS[appType]}?term=2267`);
        if (!r.ok) throw new Error(`Failed to fetch ${appType} applications`);
        const data = await r.json();

        // Normalize minor field name differences so columns can be shared.
        const normalized = data.map((d) => ({
          ...d,
          ProgrammingLanguages: d.ProgrammingLanguages ?? d.ProgrammingLanguage ?? '',
          AppType: appType,
          FullName: d.FirstName && d.LastName ? `${d.FirstName} ${d.LastName}` : d.Name ?? '',
        }));

        setRows(normalized);
      } catch (e) {
        setError(String(e));
      }
      setLoading(false);
    };
    fetchData();
  }, [appType]);

  // FULL column set = union of Masters + PhD DTOs (plus a couple helpers)
  const ALL_COLUMNS = useMemo(() => [
    // Core / common
    { field: 'Id', headerName: 'ID', headerAlign: 'center', width: 80 },
    { field: 'Name', headerName: 'Name', headerAlign: 'center', flex: 1, minWidth: 160 },
    // { field: 'FullName', headerName: 'Full Name', headerAlign: 'center', flex: 1, minWidth: 180 },
    { field: 'FirstName', headerName: 'First Name', headerAlign: 'center', width: 140 },
    { field: 'LastName', headerName: 'Last Name', headerAlign: 'center', width: 140 },
    { field: 'Email', headerName: 'Email', headerAlign: 'center', flex: 1.2, minWidth: 220 },
    { field: 'ASUEmail', headerName: 'ASU Email', headerAlign: 'center', flex: 1, minWidth: 200 },
    { field: 'ASU_ID', headerName: 'ASU ID', headerAlign: 'center', width: 120 },
    { field: 'DegreeProgram', headerName: 'Degree Program', headerAlign: 'center', flex: 1.2, minWidth: 220 },

    // Dates
    {
      field: 'ExpectedGraduation',
      headerName: 'Expected Grad',
      headerAlign: 'center',
      width: 140,
      renderCell: (params) => {
        const v = params.value;
        if (!v) return '';
        const date = new Date(v);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      }
    },

    // Academics
    { field: 'GraduateGPA', headerName: 'Grad GPA', headerAlign: 'center', width: 110 },
    { field: 'UndergraduateGPA', headerName: 'UG GPA', headerAlign: 'center', width: 110 },
    { field: 'UndergraduateInstitution', headerName: 'UG Institution', headerAlign: 'center', flex: 1, minWidth: 220 },
    { field: 'StartOfPhdYear', headerName: 'Start of PhD Year', headerAlign: 'center', width: 160 }, // PhD-only

    // Work prefs
    { field: 'PositionsConsidered', headerName: 'Positions', headerAlign: 'center', width: 180 },
    { field: 'HoursAvailable', headerName: 'Hours Available', headerAlign: 'center', width: 140 },
    { field: 'PreferredCourses', headerName: 'Preferred Courses', headerAlign: 'center', flex: 1, minWidth: 220 },
    { field: 'ProgrammingLanguages', headerName: 'Programming Languages', headerAlign: 'center', flex: 1, minWidth: 220 },

    // Misc assessments / milestones
    { field: 'TASpeakTestScore', headerName: 'TA Speak / iBT', headerAlign: 'center', width: 160 },
    { field: 'ThesisProposalStatus', headerName: 'Thesis/Proposal', headerAlign: 'center', width: 180 },
    { field: 'ComprehensiveExam', headerName: 'Comprehensive Exam', headerAlign: 'center', width: 180 }, // PhD-only
    { field: 'ResearchAccomplishments', headerName: 'Research Accomplishments', headerAlign: 'center', flex: 1.2, minWidth: 260 }, // PhD-only (long text)

    // Docs
    {
      field: 'TranscriptUrl',
      headerName: 'Transcript',
      headerAlign: 'center',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <a href={params.value} target="_blank" rel="noopener noreferrer">View</a>
        ) : 'N/A'
    },
    {
      field: 'ResumeUrl',
      headerName: 'Resume',
      headerAlign: 'center',
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <a href={params.value} target="_blank" rel="noopener noreferrer">View</a>
        ) : 'N/A'
    },

    // Helper meta
    { field: 'AppType', headerName: 'App Type', headerAlign: 'center', width: 110 },
  ], []);

  // PhD-only column fields (memoized to prevent unnecessary recalculations)
  const PhD_ONLY_FIELDS = useMemo(() => ['StartOfPhdYear', 'ComprehensiveExam', 'ResearchAccomplishments'], []);

  // Filter columns based on application type
  const FILTERED_COLUMNS = useMemo(() => {
    return ALL_COLUMNS.filter(col => {
      // If it's a PhD-only column and we're viewing Masters, hide it
      if (appType === 'Masters' && PhD_ONLY_FIELDS.includes(col.field)) {
        return false;
      }
      return true;
    });
  }, [ALL_COLUMNS, appType, PhD_ONLY_FIELDS]);

  // Defaults to show on first render (everything else is available in Columns menu)
  const DEFAULT_VISIBLE = useMemo(() => ([
    'Name',
    // 'Email',
    'ASU_ID',
    'DegreeProgram',
    'GraduateGPA',
    'UndergraduateGPA',
    // 'UndergraduateInstitution',
    'PositionsConsidered',
    'HoursAvailable',
    'PreferredCourses',
    'ProgrammingLanguages',
    'ThesisProposalStatus',
    'ExpectedGraduation',
    'TranscriptUrl',
    'ResumeUrl',
  ]), []);

  // Build the initial visibility model (true for defaults, false otherwise)
  const initialVisibility = useMemo(() => {
    const model = {};
    for (const col of FILTERED_COLUMNS) {
      model[col.field] = DEFAULT_VISIBLE.includes(col.field);
    }
    return model;
  }, [FILTERED_COLUMNS, DEFAULT_VISIBLE]);

  // Striped rows function
  const getRowClassName = (params) => {
    return params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row';
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {appType} Application List
          </Typography>
          <Chip
            label={`${rows.length} records`}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontStyle: 'italic' }}>
          Summer 2026
        </Typography>
      </Box>

      <Box mb={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Application Type</InputLabel>
          <Select
            value={appType}
            label="Application Type"
            onChange={(e) => setAppType(e.target.value)}
          >
            <MenuItem value="Masters">Masters Applications</MenuItem>
            <MenuItem value="PhD">PhD Applications</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleResetColumns}
        >
          Reset Columns
        </Button>
      </Box>

      {/* Helper text */}
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        Tip: Click the <b>Columns</b> button in the toolbar to show/hide fields or drag to reorder.
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontStyle: 'italic' }}>
        Note: When downloading or printing, only the columns currently visible on the page will be included. Adjust your visible columns before exporting.
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          Error: {error}
        </Typography>
      )}

      <div style={{ height: '1750px', width: '100%' }}>
        <DataGridPremium
          key={`${gridKey}-${appType}`}
          rows={rows}
          columns={FILTERED_COLUMNS}
          getRowId={(row) => row.Id}
          getRowClassName={getRowClassName}
          loading={loading}
          // Column sizing state
          columnSizingModel={columnState}
          onColumnSizingModelChange={(newState) => setColumnState(newState)}
          // initial config
          initialState={{
            density: 'standard',
            columns: { columnVisibilityModel: initialVisibility },
            // Pivot starting layout — opt-in via the Pivot button in the toolbar.
            pivoting: {
              active: false,
              panelOpen: false,
              model: {
                rows: [{ field: 'DegreeProgram' }],
                columns: [{ field: 'PositionsConsidered' }],
                values: [{ field: 'Name', aggFunc: 'size' }],
              },
            },
          }}
          // DataGridPro v6+: use `pageSizeOptions`
          pageSizeOptions={[25, 50, 100, { value: rows.length, label: 'All' }]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          // UX
          pagination
          slots={{
            toolbar: CustomToolbarWithPivot,
          }}
          showToolbar
          headerFilters
          disableSelectionOnClick
          allowColumnReordering
          sx={dataGridSx}
        />
      </div>
    </Paper>
  );
}
