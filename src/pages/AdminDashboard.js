import React, { useState, useEffect } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox, Snackbar, Alert
} from '@mui/material';

const baseUrl = process.env.REACT_APP_API_BASE;

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

export default function AdminDashboard() {
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
    const handler = () => {
      setReviewedRows(JSON.parse(localStorage.getItem('reviewedRows') || '{}'));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [reviewStatus, setReviewStatus] = useState({
    ssn_Sent: false,
    offer_Sent: false,
    offer_Signed: false,
  });

  const columns = [
    { field: 'assignmentId', headerName: 'ID', headerAlign: 'center', width: 70, type: 'number' },
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', width: 140 },
    { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', width: 100 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', width: 150 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', width: 80 },
    { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', width: 120 },
    { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 220, filterable: true },
    { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 110 },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 250 },
    { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 100 },
    { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 100, type: 'number' },
    {
      field: 'course',
      headerName: 'Course',
      headerAlign: 'center',
      width: 130,
      valueGetter: (value, row) => {
        return `${row.subject} - ${row.catalogNum}`;
      }
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
      renderCell: (params) => {
        const { ssn_Sent, offer_Sent, offer_Signed } = params.row;

        const isGreen = ssn_Sent && offer_Sent && offer_Signed;
        const isOrange = ssn_Sent && offer_Sent && !offer_Signed;

        let buttonStyle = {};
        if (isGreen) {
          buttonStyle = {
            backgroundColor: '#2e7d32',
            '&:hover': { backgroundColor: '#45a049' }
          };
        } else if (isOrange) {
          buttonStyle = {
            backgroundColor: '#f57c00',
            '&:hover': { backgroundColor: '#e65100' }
          };
        }

        const hasColor = isGreen || isOrange;

        return (
          <Button
            variant={hasColor ? "contained" : "outlined"}
            size="small"
            onClick={() => handleOpenModal(params.row)}
            sx={buttonStyle}
          >
            Review
          </Button>
        );
      },
    },
    { field: 'position_Number', headerName: 'Position Number', headerAlign: 'center', width: 140 },
    { field: 'instructorEdit', headerName: 'Instructor Edit', headerAlign: 'center', width: 120 },
    {
      field: 'reviewed',
      headerName: 'Reviewed',
      width: 90,
      type: 'boolean',
      renderCell: (params) => (
        <Checkbox
          checked={!!reviewedRows[params.row.id]}
          disabled
          color="success"
        />
      ),
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      description: 'Shows if assignment has been reviewed (read-only in Admin view)'
    },
    { field: 'importedBy', headerName: 'Imported By', headerAlign: 'center', width: 120 },
    { field: 'createdAt', headerName: 'Date Created', headerAlign: 'center', width: 170, display: 'none' }
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
    setReviewStatus((prev) => ({
      ...prev,
      [name]: checked
    }));
  }

  async function handleSaveReview() {
    try {
      const payload = {
        Position_Number: selectedRow.position_Number,
        SSN_Sent: reviewStatus.ssn_Sent,
        Offer_Sent: reviewStatus.offer_Sent,
        Offer_Signed: reviewStatus.offer_Signed,
      };

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRow.id
            ? {
                ...row,
                ssn_Sent: reviewStatus.ssn_Sent,
                offer_Sent: reviewStatus.offer_Sent,
                offer_Signed: reviewStatus.offer_Signed,
                position_Number: payload.Position_Number
              }
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
        credentials: 'include',
        body: JSON.stringify({
          Position_Number: newRow.position_Number,
          SSN_Sent: newRow.ssn_Sent ?? false,
          Offer_Sent: newRow.offer_Sent ?? false,
          Offer_Signed: newRow.offer_Signed ?? false,
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
    fetch(`${baseUrl}/api/StudentClassAssignment/admin`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        const mapped = data.map(r => ({
          id: r.Id,
          assignmentId: r.Id,
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
          importedBy: r.ImportedBy || '',
          instructorEdit: r.Instructor_Edit || '',
          createdAt: formatToLocal(r.CreatedAt),
          reviewed: reviewedRows[r.Id] || false,
        }));

        setRows(mapped);
        setError('');
      })
      .catch(err => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [reviewedRows, recentlyEdited]);

  const getCellClassName = (params) => {
    if (reviewedRows[params.row.id]) return '';
    const edited = recentlyEdited.find(r => r.id === params.row.id);
    if (edited && edited.changed_fields && edited.changed_fields.includes(params.field)) {
      return 'highlight-cell';
    }
    return '';
  };

  const getRowClassName = (params) => {
    if (params.row.instructorEdit === 'D') {
      return 'deleted-row';
    }
    if (params.row.instructorEdit === 'Y') {
      return 'edited-row';
    }
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
      <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
          Tip: Click the <b>Columns</b> icon in the toolbar to show or hide additional fields. This view shows ALL assignments including edited ones.
        </Typography>
        <DataGridPro
          sx={{
            '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.1em' },
            '& .MuiDataGrid-columnHeaders': {
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
              '&:hover': {
                backgroundColor: '#ffcdd2',
              },
            },
            '& .edited-row': {
              backgroundColor: '#e3f2fd',
              '&:hover': {
                backgroundColor: '#bbdefb',
              },
            },
            '& .even-row': {
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#e8e8e8',
              },
            },
            '& .odd-row': {
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            },
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
          pageSizeOptions={[25, 50, 100, { value: rows.length, label: 'All' }]}
          disableSelectionOnClick
          allowColumnReordering
          showToolbar
          headerFilters
          processRowUpdate={handleRowUpdate}
        />
      </div>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Review Assignment: {selectedRow?.studentName}</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox
                name="ssn_Sent"
                checked={reviewStatus.ssn_Sent}
                onChange={handleCheckboxChange} />}
              label="SSN Sent"
            />
            <FormControlLabel
              control={<Checkbox
                name="offer_Sent"
                checked={reviewStatus.offer_Sent}
                onChange={handleCheckboxChange} />}
              label="Offer Sent"
            />
            <FormControlLabel
              control={<Checkbox
                name="offer_Signed"
                checked={reviewStatus.offer_Signed}
                onChange={handleCheckboxChange} />}
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
