// src/pages/StudentAssignmentDashboard.js
import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const baseUrl = process.env.REACT_APP_API_BASE;

// Density options
const DENSITY_OPTIONS = [
  { label: 'Compact density', value: 'compact' },
  { label: 'Standard density', value: 'standard' },
  { label: 'Comfortable density', value: 'comfortable' },
];

// Custom Toolbar with Density Selector
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
        slotProps={{
          list: {
            'aria-labelledby': 'density-menu-trigger',
          },
        }}
      >
        {DENSITY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              apiRef.current.setDensity(option.value);
              setDensityMenuOpen(false);
            }}
          >
            <ListItemIcon>
              {density === option.value && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </GridToolbarContainer>
  );
}

// Filter options for Position
const POSITION_OPTIONS = [
  'All',
  'TA',
  'Grader',
  'IA',
  'TA (GSA) 1 credit',
];

export default function StudentAssignmentDashboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [positionFilter, setPositionFilter] = useState('All');

  const columns = [
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1, minWidth: 150 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', width: 140 },
    { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', width: 110 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', width: 150 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', width: 90, type: 'number' },
    { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', width: 130 },
    { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1, minWidth: 160 },
    { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 120 },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1, minWidth: 160 },
    { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 110 },
    { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 110, type: 'number' },
    { field: 'classNum', headerName: 'Class #', headerAlign: 'center', width: 120 },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
    {
      field: 'otherPositions',
      headerName: 'Additional Assignments',
      headerAlign: 'center',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return '-';
        return (
          <div style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            fontSize: '0.9em',
            padding: '4px',
            maxHeight: '100%',
            overflow: 'visible'
          }}>
            {value}
          </div>
        );
      }
    },
    { field: 'location', headerName: 'Location', headerAlign: 'center', width: 130 },
    { field: 'campus', headerName: 'Campus', headerAlign: 'center', width: 120 },
    { field: 'cum_gpa', headerName: 'Cum GPA', headerAlign: 'center', width: 100 },
    { field: 'cur_gpa', headerName: 'Cur GPA', headerAlign: 'center', width: 100 },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/StudentClassAssignment/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        // First, group all assignments by student to collect their classes
        const studentAssignments = {};

        data.forEach(r => {
          const studentId = r.Student_ID;
          if (!studentAssignments[studentId]) {
            studentAssignments[studentId] = [];
          }
          studentAssignments[studentId].push({
            catalogNum: r.CatalogNum,
            subject: r.Subject,
            position: r.Position,
          });
        });

        // Now map the data, keeping all rows, and adding otherPositions to each
        const mapped = data.map(r => {
          const studentId = r.Student_ID;
          const allAssignments = studentAssignments[studentId] || [];

          // Filter out the current assignment to get "other" positions
          const otherAssignments = allAssignments.filter(
            a => !(a.catalogNum === r.CatalogNum && a.subject === r.Subject)
          );

          return {
            id: r.Id,
            studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`.trim(),
            student_ID: r.Student_ID,
            asuRite: r.ASUrite,
            position: r.Position,
            weeklyHours: r.WeeklyHours,
            fultonFellow: r.FultonFellow,
            email: r.Email,
            educationLevel: r.EducationLevel,
            instructorName: `${r.InstructorFirstName ?? ''} ${r.InstructorLastName ?? ''}`.trim(),
            subject: r.Subject,
            catalogNum: r.CatalogNum,
            classSession: r.ClassSession,
            location: r.Location,
            campus: r.Campus,
            classNum: r.ClassNum,
            cum_gpa: r.cum_gpa,
            cur_gpa: r.cur_gpa,
            otherPositions: otherAssignments.length > 0
              ? otherAssignments.map(a => `${a.subject} - ${a.catalogNum} (${a.position})`).join('\n')
              : '',
          };
        });

        setRows(mapped);
        setError('');
      })
      .catch(err => {
        setError(err.message || 'Error loading data');
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleRows = useMemo(() => {
    if (positionFilter === 'All') return rows;
    const wanted = positionFilter.toLowerCase();
    return rows.filter(r =>
      (r.position ?? '').toLowerCase() === wanted ||
      (wanted === 'ta (gsa) 1 credit' &&
        ['ta gsa 1 credit', 'ta gsa', 'ta (gsa)'].includes((r.position ?? '').toLowerCase()))
    );
  }, [rows, positionFilter]);

  // Striped rows function
  const getRowClassName = (params) => {
    return params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row';
  };

  if (error) {
    return (
      <Paper style={{ padding: 16, margin: 20 }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Student Assignment Dashboard
          </Typography>
          <Chip
            label={`${visibleRows.length} record${visibleRows.length !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Position Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Position</InputLabel>
          <Select
            value={positionFilter}
            label="Filter by Position"
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            {POSITION_OPTIONS.map((pos) => (
              <MenuItem key={pos} value={pos}>{pos}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Helper tip */}
      <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
        Tip: Click the <b>Columns</b>{' '}
        <ViewColumnIcon sx={{ fontSize: '1.25rem', verticalAlign: 'text-bottom', display: 'inline' }} />{' '}
        button in the toolbar to show/hide fields or drag to reorder.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Typography color="error" mb={2}>
          Error: {error}
        </Typography>
      )}

      <div style={{ height: 'calc(100vh - 260px)', width: '100%' }}>
        <DataGridPro
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f9f9f9',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.05em' },
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
          rows={visibleRows}
          columns={columns}
          getRowClassName={getRowClassName}
          loading={loading}
          pagination
          initialState={{
            pagination: { paginationModel: { pageSize: 50, page: 0 } },
            density: 'standard',
            columns: {
              columnVisibilityModel: {
                cum_gpa: false,
                cur_gpa: false,
                location: false,
                campus: false,
              }
            },
          }}
          pageSizeOptions={[25, 50, 100, { value: visibleRows.length || 1, label: 'All' }]}
          disableSelectionOnClick
          allowColumnReordering
          slots={{ toolbar: CustomToolbar }}
          showToolbar
          headerFilters
        />
      </div>
    </Paper>
  );
}
