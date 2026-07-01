import React, { useState, useEffect, useMemo } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Paper, Typography, Snackbar, Alert, Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CustomToolbar, getDataGridSx as getBaseDataGridSx } from '../utils/dataGridStyles';

const baseUrl = process.env.REACT_APP_API_URL;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatToLocal(dbDate) {
  if (!dbDate) return '';
  if (dbDate instanceof Date) return dbDate.toLocaleString();
  let jsIsoDate = dbDate.includes('T') ? dbDate : dbDate.replace(' ', 'T') + 'Z';
  return new Date(jsIsoDate).toLocaleString();
}

// Extends shared styles with Admin-specific row classes
function getDataGridSx(theme) {
  return {
    ...getBaseDataGridSx(theme),
    '& .deleted-row': {
      backgroundColor: '#ffebee',
      '& .MuiDataGrid-cell': {
        textDecoration: 'line-through',
        color: '#c62828',
      },
      '&:hover': { backgroundColor: '#ffcdd2' },
    },
    '& .edited-row': {
      backgroundColor: '#e3f2fd',
      '&:hover': { backgroundColor: '#bbdefb' },
    },
  };
}

export default function AdminDashboard() {
  const theme = useTheme();
  const dataGridSx = useMemo(() => getDataGridSx(theme), [theme]);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // DataGrid columns — matches MasterDashboard
  const columns = [
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1.4, minWidth: 130 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.9, minWidth: 100 },
    { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', flex: 1, minWidth: 110 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', flex: 0.5, minWidth: 60 },
    { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', flex: 0.8, minWidth: 90 },
    { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1.4, minWidth: 150, filterable: true },
    { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', flex: 0.7, minWidth: 75 },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1.2, minWidth: 130 },
    { field: 'instructorEmail', headerName: 'Instructor Email', headerAlign: 'center', flex: 1.4, minWidth: 180 },
    {
      field: 'course',
      headerName: 'Course',
      headerAlign: 'center',
      flex: 0.8,
      minWidth: 90,
      valueGetter: (value, row) => `${row.subject} - ${row.catalogNum}`,
    },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
    { field: 'location', headerName: 'Location', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'campus', headerName: 'Campus', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'classNum', headerName: 'Class #', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'costCenterKey', headerName: 'Cost Center', headerAlign: 'center', flex: 1, minWidth: 120 },
    { field: 'compensation', headerName: 'Compensation', headerAlign: 'center', flex: 0.8, minWidth: 100, type: 'number', valueFormatter: (value) => currencyFormatter.format(value), cellClassName: 'font-tabular-nums' },
    { field: 'position_Number', headerName: 'Position Num', headerAlign: 'center', flex: 0.9, minWidth: 130, editable: true },
    {
      field: 'instructorEdit',
      headerName: 'Instructor Edit',
      flex: 0.7,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (value) => {
        if (value === 'Y') return 'Edited';
        if (value === 'D') return 'Deleted';
        return '';
      },
    },
    { field: 'importedBy', headerName: 'Imported By', headerAlign: 'center', flex: 0.8, minWidth: 90 },
    { field: 'createdAt', headerName: 'Date Created', headerAlign: 'center', flex: 1.25, minWidth: 130, display: 'none' },
    { field: 'notes', headerName: 'Notes', headerAlign: 'center', flex: 2, minWidth: 200, editable: true },
    { field: 'status', headerName: 'Status', headerAlign: 'center', flex: 1, minWidth: 120, editable: true },
    { field: 'jobRequisition', headerName: 'Job Req', headerAlign: 'center', flex: 0.9, minWidth: 110, editable: true },
  ];

  // Handle cell/row updates for editable columns
  const handleRowUpdate = async (newRow) => {
    try {
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${newRow.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Position_Number: newRow.position_Number,
          SSN_Sent: newRow.ssn_Sent ?? false,
          Offer_Sent: newRow.offer_Sent ?? null,
          Offer_Signed: newRow.offer_Signed ?? false,
          Offer_Sent_Workday: newRow.offer_Sent_Workday ?? false,
          Offer_Signed_Workday: newRow.offer_Signed_Workday ?? false,
          Notes: newRow.notes ?? null,
          Status: newRow.status ?? null,
          Job_Requisition: newRow.jobRequisition ?? null,
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      return newRow;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  // Load data from API - using admin endpoint
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/StudentClassAssignment/admin`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
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
          instructorEmail: r.InstructorEmail || '',
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
          offer_Sent_Workday: r.Offer_Sent_Workday,
          offer_Signed_Workday: r.Offer_Signed_Workday,
          importedBy: r.ImportedBy || '',
          instructorEdit: r.Instructor_Edit || '',
          createdAt: formatToLocal(r.CreatedAt),
          notes: r.Notes || '',
          status: r.Status || '',
          jobRequisition: r.Job_Requisition || '',
        }));

        setRows(mapped);
        setError('');
      })
      .catch(err => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getRowClassName = (params) => {
    if (params.row.instructorEdit === 'D') return 'deleted-row';
    if (params.row.instructorEdit === 'Y') return 'edited-row';
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
    <>
      <Paper elevation={3} sx={{ p: 3, m: 2, minHeight: 'calc(100vh - 140px)' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
          Tip: Click the <b>Columns</b> button in the toolbar to show/hide fields or drag to reorder. This view shows ALL assignments including edited and deleted.
        </Typography>
        <Box sx={{ height: 'calc(100vh - 200px)', flexGrow: 1 }}>
          <DataGridPro
            sx={dataGridSx}
            pagination
            rows={rows}
            columns={columns}
            getRowClassName={getRowClassName}
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
              density: 'compact',
              columns: {
                columnVisibilityModel: {
                  fultonFellow: false,
                  campus: false,
                  compensation: false,
                  importedBy: false,
                },
              },
            }}
            pageSizeOptions={[25, 50, 100, { value: rows.length, label: 'All' }]}
            disableSelectionOnClick
            allowColumnReordering
            slots={{ toolbar: CustomToolbar }}
            showToolbar
            headerFilters
            processRowUpdate={handleRowUpdate}
          />
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
