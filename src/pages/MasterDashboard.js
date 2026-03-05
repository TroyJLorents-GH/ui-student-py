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
  Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox, Snackbar, Alert,
  Box, Chip, Divider, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const baseUrl = process.env.REACT_APP_API_BASE;
if (!baseUrl) console.error("REACT_APP_API_BASE is not defined");

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

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const usdPrice = {
  type: 'number',
  width: 130,
  valueFormatter: (value) => currencyFormatter.format(value),
  cellClassName: 'font-tabular-nums',
};

function formatToLocal(dbDate) {
  if (!dbDate) return '';
  if (dbDate instanceof Date) return dbDate.toLocaleString();
  let jsIsoDate = dbDate.includes('T') ? dbDate : dbDate.replace(' ', 'T') + 'Z';
  return new Date(jsIsoDate).toLocaleString();
}

export default function MasterDashboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [recentlyEdited, setRecentlyEdited] = useState(() => {
    return JSON.parse(localStorage.getItem('recentlyEditedAssignments') || '[]');
  });
  const [reviewedRows, setReviewedRows] = useState(() => {
    return JSON.parse(localStorage.getItem('reviewedRows') || '{}');
  });

  useEffect(() => {
    const handler = () => {
      setRecentlyEdited(JSON.parse(localStorage.getItem('recentlyEditedAssignments') || '[]'));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem('reviewedRows', JSON.stringify(reviewedRows));
  }, [reviewedRows]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [reviewStatus, setReviewStatus] = useState({
    ssn_Sent: false,
    offer_Sent: false,
    offer_Signed: false,
  });

  function handleReviewed(rowId) {
    const row = rows.find(r => r.id === rowId);
    const isCurrentlyReviewed = reviewedRows[rowId];

    setReviewedRows(prev => {
      const updated = { ...prev };
      if (isCurrentlyReviewed) {
        delete updated[rowId];
      } else {
        updated[rowId] = true;
        if (row && row.instructorEdit === 'D') {
          setRows(currentRows => currentRows.filter(r => r.id !== rowId));
          setSnackbar({ open: true, message: 'Deleted assignment removed from view', severity: 'success' });
        } else {
          const newRecentlyEdited = recentlyEdited.filter(r => r.id !== rowId);
          setRecentlyEdited(newRecentlyEdited);
          localStorage.setItem('recentlyEditedAssignments', JSON.stringify(newRecentlyEdited));
        }
      }
      return updated;
    });
  }

  const columns = [
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1.5, minWidth: 150 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.9, minWidth: 110 },
    { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', width: 100 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', flex: 1, minWidth: 110 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', flex: 0.5, minWidth: 70 },
    { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', flex: 0.8, minWidth: 100 },
    { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1.4, minWidth: 160 },
    { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 110 },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1.2, minWidth: 140 },
    { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 100 },
    { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 100, type: 'number' },
    {
      field: 'course',
      headerName: 'Course',
      headerAlign: 'center',
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => `${row.subject} - ${row.catalogNum}`,
    },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
    { field: 'location', headerName: 'Location', headerAlign: 'center', width: 120 },
    { field: 'campus', headerName: 'Campus', headerAlign: 'center', width: 110 },
    { field: 'classNum', headerName: 'Class #', headerAlign: 'center', width: 110 },
    { field: 'cum_gpa', headerName: 'Cum GPA', headerAlign: 'center', width: 90 },
    { field: 'cur_gpa', headerName: 'Cur GPA', headerAlign: 'center', width: 90 },
    { field: 'costCenterKey', headerName: 'Cost Center', headerAlign: 'center', width: 160 },
    { field: 'compensation', headerName: 'Compensation', headerAlign: 'center', ...usdPrice },
    {
      field: 'review',
      headerName: 'Review',
      headerAlign: 'center',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)}>
          Review
        </Button>
      ),
    },
    { field: 'position_Number', headerName: 'Position Number', headerAlign: 'center', width: 140, editable: true },
    {
      field: 'reviewed',
      headerName: 'Reviewed',
      width: 90,
      type: 'boolean',
      renderCell: (params) => (
        <Checkbox
          checked={!!reviewedRows[params.row.id]}
          onChange={() => handleReviewed(params.row.id)}
          color="success"
        />
      ),
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      description: 'Check when changes have been reviewed'
    },
    { field: 'createdAt', headerName: 'Date Created', headerAlign: 'center', width: 170 }
  ];

  function handleOpenModal(row) {
    setSelectedRow(row);
    setReviewStatus({
      ssn_Sent: row.ssn_Sent ?? false,
      offer_Sent: row.offer_Sent ?? false,
      offer_Signed: row.offer_Signed ?? false,
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedRow(null);
  }

  function handleCheckboxChange(e) {
    const { name, checked } = e.target;
    setReviewStatus((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSaveReview() {
    try {
      const payload = {
        Position_Number: selectedRow.position_Number,
        SSN_Sent: reviewStatus.ssn_Sent,
        Offer_Sent: reviewStatus.offer_Sent,
        Offer_Signed: reviewStatus.offer_Signed
      };

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRow.id
            ? { ...row, ssn_Sent: reviewStatus.ssn_Sent, offer_Sent: reviewStatus.offer_Sent, offer_Signed: reviewStatus.offer_Signed, position_Number: payload.Position_Number }
            : row
        )
      );

      handleCloseModal();
    } catch (err) {
      console.error('Error updating assignment:', err);
    }
  }

  const handleRowUpdate = async (newRow) => {
    try {
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${newRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Position_Number: newRow.position_Number,
          SSN_Sent: newRow.ssn_Sent ?? false,
          Offer_Sent: newRow.offer_Sent ?? false,
          Offer_Signed: newRow.offer_Signed ?? false
        })
      });

      if (!response.ok) throw new Error('Failed to update position number');
      return newRow;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/StudentClassAssignment/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        const currentReviewed = JSON.parse(localStorage.getItem('reviewedRows') || '{}');

        const mapped = data.map(r => ({
          id: r.Id,
          studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`.trim(),
          student_ID: r.Student_ID,
          asuRite: r.ASUrite,
          position: r.Position,
          weeklyHours: r.WeeklyHours,
          fultonFellow: r.FultonFellow,
          email: r.Email,
          educationLevel: r.EducationLevel,
          instructorName: `${r.InstructorFirstName} ${r.InstructorLastName}`.trim(),
          subject: r.Subject,
          catalogNum: r.CatalogNum,
          classSession: r.ClassSession,
          location: r.Location,
          campus: r.Campus,
          classNum: r.ClassNum,
          cum_gpa: r.cum_gpa,
          cur_gpa: r.cur_gpa,
          costCenterKey: r.CostCenterKey,
          compensation: r.Compensation,
          position_Number: r.Position_Number || '',
          ssn_Sent: r.SSN_Sent,
          offer_Sent: r.Offer_Sent,
          offer_Signed: r.Offer_Signed,
          instructorEdit: r.Instructor_Edit || null,
          createdAt: formatToLocal(r.CreatedAt),
          reviewed: currentReviewed[r.Id] || false,
        }));

        const filtered = mapped.filter(row => {
          if (row.instructorEdit === 'D' && currentReviewed[row.id]) return false;
          return true;
        });

        setRows(filtered);
        setError('');
      })
      .catch(err => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [recentlyEdited]);

  const getCellClassName = (params) => {
    if (reviewedRows[params.row.id]) return '';
    const edited = recentlyEdited.find(r => r.id === params.row.id);
    if (edited && edited.changed_fields && edited.changed_fields.includes(params.field)) {
      return 'highlight-cell';
    }
    return '';
  };

  const getRowClassName = (params) => {
    if (params.row.instructorEdit === 'D') return 'deleted-row';
    return params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row';
  };

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Master Dashboard
            </Typography>
            <Chip
              label={`${rows.length} assignment${rows.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Helper tip */}
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
          Tip: Click the <b>Columns</b>{' '}
          <ViewColumnIcon sx={{ fontSize: '1.25rem', verticalAlign: 'text-bottom', display: 'inline' }} />{' '}
          button in the toolbar to show/hide fields. Click <b>Review</b> to update HR document status. Position Number is editable inline.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* DataGrid */}
        <div style={{ height: 'calc(100vh - 260px)', width: '100%' }}>
          <DataGridPro
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
              '& .MuiDataGrid-cell': { textAlign: 'center' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.05em' },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f9f9f9',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              },
              '& .highlight-cell': {
                backgroundColor: '#fff9c4',
                fontWeight: 600,
              },
              '& .deleted-row': {
                backgroundColor: '#ffebee',
                '& .MuiDataGrid-cell': {
                  textDecoration: 'line-through',
                  color: '#c62828',
                },
                '&:hover': { backgroundColor: '#ffcdd2' },
              },
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
            pagination
            rows={rows}
            columns={columns}
            getCellClassName={getCellClassName}
            getRowClassName={getRowClassName}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
              density: 'compact',
              columns: {
                columnVisibilityModel: {
                  subject: false,
                  catalogNum: false,
                  createdAt: false,
                  cum_gpa: false,
                  cur_gpa: false,
                  asuRite: false,
                },
              },
            }}
            pageSizeOptions={[25, 50, 100, { value: rows.length || 1, label: 'All' }]}
            disableSelectionOnClick
            allowColumnReordering
            slots={{ toolbar: CustomToolbar }}
            showToolbar
            headerFilters
            processRowUpdate={handleRowUpdate}
          />
        </div>
      </Paper>

      {/* Modal Review */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Review Assignment: {selectedRow?.studentName}</DialogTitle>
        <DialogContent dividers>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox name="ssn_Sent" checked={reviewStatus.ssn_Sent} onChange={handleCheckboxChange} />}
              label="SSN Sent"
            />
            <FormControlLabel
              control={<Checkbox name="offer_Sent" checked={reviewStatus.offer_Sent} onChange={handleCheckboxChange} />}
              label="Offer Sent"
            />
            <FormControlLabel
              control={<Checkbox name="offer_Signed" checked={reviewStatus.offer_Signed} onChange={handleCheckboxChange} />}
              label="Offer Signed"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveReview} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
