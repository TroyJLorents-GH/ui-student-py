import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';

const baseUrl = process.env.REACT_APP_API_URL;

const columns = [
  { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 200 },
  { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', width: 140 },
  { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', width: 100 },
  { field: 'position', headerName: 'Position', headerAlign: 'center', width: 150 },
  { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', width: 80, editable: true }, // Editable!
  { field: 'fultonFellow', headerName: 'Fulton Fellow', headerAlign: 'center', width: 120 },
  { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300, filterable: true },
  { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 120 },
  { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300 },
  { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 100 },
  { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 100, type: 'number' },
  { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
  { field: 'location', headerName: 'Location', headerAlign: 'center', width: 120 },
  { field: 'campus', headerName: 'Campus', headerAlign: 'center', width: 110 },
  { field: 'classNum', headerName: 'Class #', headerAlign: 'center', width: 110 }
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

  // In-line update
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
         }) // Only allow updating allowed fields
      });
      if (!res.ok) throw new Error('Failed to update assignment');
      setSnackbar({ open: true, message: 'Updated successfully!', severity: 'success' });
      return newRow;
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      return null;
    }
  };

  return (
    <Paper elevation={3} style={{ padding: 24, margin: 24 }}>
      <Typography variant="h5" gutterBottom>
        Manage Student Assignments
      </Typography>
      <Grid container spacing={2} alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item>
          <TextField
            label="Instructor ID"
            value={instructorId}
            onChange={e => setInstructorId(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleFetch}>
            Fetch Students
          </Button>
        </Grid>
      </Grid>
      <div style={{ height: 600, width: '100%' }}>
        <DataGridPro
          sx={{
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.1em' },
            '& .highlight-cell': {
              backgroundColor: '#fff9c4',
              fontWeight: 600,
            },
          }}
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } }
          }}
          disableSelectionOnClick
          showToolbar
          allowColumnReordering={true}
          experimentalFeatures={{ newEditingApi: true }}
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