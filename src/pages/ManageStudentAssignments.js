import React, { useState, useRef } from 'react';
import {
  Paper, Typography, TextField, Button, Grid, Snackbar, Alert,
  Box, Chip, Divider, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
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
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const baseUrl = process.env.REACT_APP_API_BASE;

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

const columns = [
  { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1.5, minWidth: 150 },
  { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.9, minWidth: 110 },
  { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', flex: 0.8, minWidth: 90 },
  { field: 'position', headerName: 'Position', headerAlign: 'center', flex: 1, minWidth: 110 },
  { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', flex: 0.5, minWidth: 70, editable: true, type: 'number' },
  { field: 'fultonFellow', headerName: 'Fulton Fellow', headerAlign: 'center', flex: 0.8, minWidth: 100 },
  { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1.4, minWidth: 160 },
  { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 110 },
  { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1.2, minWidth: 140 },
  {
    field: 'course',
    headerName: 'Course',
    headerAlign: 'center',
    flex: 1,
    minWidth: 120,
    valueGetter: (value, row) => `${row.subject} - ${row.catalogNum}`,
  },
  { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
  { field: 'classNum', headerName: 'Class #', headerAlign: 'center', width: 100 },
  { field: 'location', headerName: 'Location', headerAlign: 'center', width: 120 },
  { field: 'campus', headerName: 'Campus', headerAlign: 'center', width: 110 },
];

const ManageStudentAssignments = () => {
  const [instructorId, setInstructorId] = useState('');
  const [rows, setRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFetch = async () => {
    if (!instructorId) {
      setSnackbar({ open: true, message: 'Please enter an Instructor ID.', severity: 'warning' });
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/manage-assignments/by-instructor/${instructorId}`);
      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      const mapped = data.map(r => ({
        id: r.Id,
        studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`,
        student_ID: r.Student_ID,
        asuRite: r.ASUrite,
        position: r.Position,
        weeklyHours: r.WeeklyHours,
        fultonFellow: r.FultonFellow,
        email: r.Email,
        educationLevel: r.EducationLevel,
        instructorName: `${r.InstructorFirstName} ${r.InstructorLastName}`,
        subject: r.Subject,
        catalogNum: r.CatalogNum,
        classSession: r.ClassSession,
        location: r.Location,
        campus: r.Campus,
        classNum: r.ClassNum,
        acadCareer: r.AcadCareer
      }));
      setRows(mapped);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      setRows([]);
    }
  };

  const processRowUpdate = async (newRow) => {
    try {
      const res = await fetch(`${baseUrl}/api/manage-assignments/${newRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          WeeklyHours: newRow.weeklyHours,
          Position: newRow.position,
          Subject: newRow.subject,
          CatalogNum: newRow.catalogNum,
          ClassSession: newRow.classSession,
          ClassNum: newRow.classNum,
          FultonFellow: newRow.fultonFellow
        })
      });
      if (!res.ok) throw new Error('Failed to update assignment');
      setSnackbar({ open: true, message: 'Updated successfully!', severity: 'success' });
      return newRow;
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      return null;
    }
  };

  const getRowClassName = (params) =>
    params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row';

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Manage Student Assignments
          </Typography>
          {rows.length > 0 && (
            <Chip
              label={`${rows.length} student${rows.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Search */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <TextField
            label="Instructor ID"
            value={instructorId}
            onChange={e => setInstructorId(e.target.value)}
            variant="outlined"
            size="small"
            helperText="Enter instructor ID to load their students"
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleFetch}>
            Fetch Students
          </Button>
        </Grid>
      </Grid>

      {rows.length > 0 && (
        <>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
            Tip: <b>Hours</b> column is editable — double-click a cell to change it. Use the <b>Columns</b>{' '}
            <ViewColumnIcon sx={{ fontSize: '1.25rem', verticalAlign: 'text-bottom', display: 'inline' }} />{' '}
            button to show/hide fields.
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      <div style={{ height: rows.length > 0 ? 'calc(100vh - 320px)' : 200, width: '100%' }}>
        <DataGridPro
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.05em' },
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
          rows={rows}
          columns={columns}
          getRowClassName={getRowClassName}
          processRowUpdate={processRowUpdate}
          pagination
          initialState={{
            pagination: { paginationModel: { pageSize: 50, page: 0 } },
            density: 'standard',
            columns: {
              columnVisibilityModel: {
                location: false,
                campus: false,
              },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableSelectionOnClick
          allowColumnReordering
          slots={{ toolbar: CustomToolbar }}
          showToolbar
        />
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ManageStudentAssignments;
