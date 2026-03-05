import React, { useState, useEffect, useRef } from 'react';
import {
  DataGridPro,
  gridDensitySelector,
  ToolbarButton,
  useGridApiContext,
  useGridSelector,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro';
import {
  Paper, Typography, Box, MenuItem, FormControl, Select, InputLabel,
  Chip, Divider, Tooltip, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const baseUrl = process.env.REACT_APP_API_BASE;
if (!baseUrl) console.error("REACT_APP_API_BASE is not defined. Make sure it's set in your .env file.");

const DENSITY_OPTIONS = [
  { label: 'Compact density', value: 'compact' },
  { label: 'Standard density', value: 'standard' },
  { label: 'Comfortable density', value: 'comfortable' },
];

function CustomToolbar() {
  const apiRef = useGridApiContext();
  const density = useGridSelector(apiRef, gridDensitySelector);
  const [densityMenuOpen, setDensityMenuOpen] = useState(false);
  const densityMenuTriggerRef = useRef(null);

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport />
      <GridToolbarQuickFilter />
      <Tooltip title="Adjust row density">
        <ToolbarButton
          ref={densityMenuTriggerRef}
          id="density-menu-trigger"
          aria-controls="density-menu"
          aria-haspopup="true"
          aria-expanded={densityMenuOpen ? 'true' : undefined}
          onClick={() => setDensityMenuOpen(true)}
        >
          <SettingsIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        id="density-menu"
        anchorEl={densityMenuTriggerRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={densityMenuOpen}
        onClose={() => setDensityMenuOpen(false)}
        slotProps={{ list: { 'aria-labelledby': 'density-menu-trigger' } }}
      >
        {DENSITY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => { apiRef.current.setDensity(option.value); setDensityMenuOpen(false); }}
          >
            <ListItemIcon>{density === option.value && <CheckIcon fontSize="small" />}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </GridToolbarContainer>
  );
}

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [degreeFilter, setDegreeFilter] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${baseUrl}/api/MastersIAGraderApplication/`);
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchApplications();
  }, []);

  const filteredApplications = degreeFilter
    ? applications.filter(app => app.DegreeProgram === degreeFilter)
    : applications;

  const columns = [
    { field: 'Name', headerName: 'Name', headerAlign: 'center', flex: 1, minWidth: 120 },
    { field: 'Email', headerName: 'Email', headerAlign: 'center', flex: 1.2, minWidth: 180 },
    { field: 'ASU10DigitID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.6, minWidth: 100 },
    { field: 'DegreeProgram', headerName: 'Degree Program', headerAlign: 'center', flex: 1.2, minWidth: 150 },
    { field: 'GraduateGPA', headerName: 'Grad GPA', headerAlign: 'center', flex: 0.5, minWidth: 100 },
    { field: 'UndergraduateGPA', headerName: 'UG GPA', headerAlign: 'center', flex: 0.5, minWidth: 100 },
    { field: 'UndergraduateInstitution', headerName: 'UG Institution', headerAlign: 'center', flex: 1, minWidth: 130 },
    { field: 'PositionsConsidered', headerName: 'Positions', headerAlign: 'center', flex: 0.8, minWidth: 130 },
    { field: 'HoursAvailable', headerName: 'Hours Avbl', headerAlign: 'center', flex: 0.6, minWidth: 110 },
    { field: 'PreferredCourses', headerName: 'Preferred Courses', headerAlign: 'center', flex: 1, minWidth: 150 },
    { field: 'ProgrammingLanguage', headerName: 'Programming Languages', headerAlign: 'center', flex: 1, minWidth: 150 },
    { field: 'DissertationProposalStatus', headerName: 'Thesis', headerAlign: 'center', flex: 0.8, minWidth: 100 },
    {
      field: 'ExpectedGraduation',
      headerName: 'Expected Grad',
      headerAlign: 'center',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => {
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      }
    },
    {
      field: 'TranscriptUrl',
      headerName: 'Transcript',
      headerAlign: 'center',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) =>
        params.value ? (
          <a href={params.value} target="_blank" rel="noopener noreferrer">View</a>
        ) : 'N/A'
    },
    {
      field: 'ResumeUrl',
      headerName: 'Resume',
      headerAlign: 'center',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) =>
        params.value ? (
          <a href={params.value} target="_blank" rel="noopener noreferrer">View</a>
        ) : 'N/A'
    }
  ];

  const getRowClassName = (params) =>
    params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row';

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Masters Application List
          </Typography>
          <Chip
            label={`${filteredApplications.length} applicant${filteredApplications.length !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Filter by Degree Program</InputLabel>
          <Select
            value={degreeFilter}
            label="Filter by Degree Program"
            onChange={(e) => setDegreeFilter(e.target.value)}
          >
            <MenuItem value="">All Programs</MenuItem>
            <MenuItem value="M.S. in Software Engineering">M.S. in Software Engineering</MenuItem>
            <MenuItem value="M.S. in Computer Science">M.S. in Computer Science</MenuItem>
            <MenuItem value="M.S. in Computer Engineering- CS">M.S. in Computer Engineering- CS</MenuItem>
            <MenuItem value="M.S. in Computer Engineering- EE">M.S. in Computer Engineering- EE</MenuItem>
            <MenuItem value="M.C.S. Master of Computer Science on ground">M.C.S. on-ground</MenuItem>
            <MenuItem value="M.C.S. Master of Computer Science online">M.C.S. online</MenuItem>
            <MenuItem value="M.S. Industrial Engineering">M.S. Industrial Engineering</MenuItem>
            <MenuItem value="M.S. in Robotics and Autonomous Systems- AI">M.S. Robotics AI</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
        Tip: Click the <b>Columns</b>{' '}
        <ViewColumnIcon sx={{ fontSize: '1.25rem', verticalAlign: 'text-bottom', display: 'inline' }} />{' '}
        button to show/hide fields. Use <b>Quick Search</b> to filter by name, email, or any text.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Typography color="error" mb={2}>Error: {error}</Typography>
      )}

      <div style={{ height: 'calc(100vh - 260px)', width: '100%' }}>
        <DataGridPro
          rows={filteredApplications}
          columns={columns}
          getRowId={(row) => row.Id}
          getRowClassName={getRowClassName}
          loading={loading}
          pagination
          initialState={{
            pagination: { paginationModel: { pageSize: 50, page: 0 } },
            density: 'standard',
            columns: {
              columnVisibilityModel: {
                UndergraduateInstitution: false,
                DissertationProposalStatus: false,
              },
            },
          }}
          pageSizeOptions={[25, 50, 100, { value: filteredApplications.length || 1, label: 'All' }]}
          disableSelectionOnClick
          allowColumnReordering
          slots={{ toolbar: CustomToolbar }}
          showToolbar
          headerFilters
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.05rem' },
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f9f9f9' },
            '& .even-row': {
              backgroundColor: '#fafafa',
              '&:hover': { backgroundColor: '#f0f0f0' },
            },
            '& .odd-row': {
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#f5f5f5' },
            },
            '& .MuiDataGrid-footerContainer': { borderTop: '2px solid #e0e0e0' },
          }}
        />
      </div>
    </Paper>
  );
};

export default ApplicationList;
