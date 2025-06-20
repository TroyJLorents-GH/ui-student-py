//// ------------------ THIS WILL HAVE THE HR CHECKBOXES TO USE FOR I-9, OFFER LETTER SENT AND MORE -------------------------


import React, { useState, useEffect } from 'react';
import {
  DataGrid
} from '@mui/x-data-grid';
import {
  Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';

const baseUrl = process.env.REACT_APP_API_URL;

if (!baseUrl) {
  console.error("REACT_APP_API_URL is not defined. Make sure it's set in your .env file.");
}

console.log("API base URL:", baseUrl);


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

export default function MasterDashboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [reviewStatus, setReviewStatus] = useState({
    I9_Sent: false,
    SSN_Sent: false,
    Offer_Sent: false,
    Offer_Signed: false,
  });

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    // TODO: fetch existing status for row if needed
    setReviewStatus({
      I9_Sent: row.I9_Sent ?? false,
      SSN_Sent: row.SSN_Sent ?? false,
      Offer_Sent: row.Offer_Sent ?? false,
      Offer_Signed: row.Offer_Signed ?? false,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setReviewStatus((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveReview = async () => {
    try {
      const payload = {
        Position_Number: selectedRow.position_Number,
        ...reviewStatus
      };
  
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) throw new Error('Failed to update assignment');
  
      // ✅ Update the local state to reflect saved checkboxes
      setRows((prevRows) =>
        prevRows.map(row =>
          row.Id === selectedRow.Id ? { ...row, ...payload } : row
        )
      );
  
      handleCloseModal();
    } catch (err) {
      console.error('Error updating assignment:', err);
    }
  };

  const columns = [
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', width: 140 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', width: 150 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', width: 80 },
    { field: 'fultonFellow', headerName: 'Fulton Fellow', headerAlign: 'center', width: 120 },
    { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300, filterable: true },
    { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 120 },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300 },
    { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 100 },
    { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 100, type: 'number' },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
    { field: 'location', headerName: 'Location', headerAlign: 'center', width: 120 },
    { field: 'campus', headerName: 'Campus', headerAlign: 'center', width: 110 },
    { field: 'classNum', headerName: 'Class #', headerAlign: 'center', width: 110 },
    { field: 'costCenterKey', headerName: 'Cost Center', headerAlign: 'center', width: 160 },
    { field: 'compensation', headerName: 'Compensation', headerAlign: 'center', width: 140, ...usdPrice },
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
    { field: 'position_Number', headerName: 'Position Number', headerAlign: 'center', width: 140, editable: true}
  ];

  useEffect(() => {
    fetch(`${baseUrl}/api/StudentClassAssignment`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        console.log("Fetched data:", data);
        const mapped = data.map(r => ({
          id: r.Id,
          studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`,
          student_ID: r.Student_ID,
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
          costCenterKey: r.CostCenterKey,
          compensation: r.Compensation,
          position_Number: r.Position_Number || '',
          I9_Sent: r.I9_Sent,
          SSN_Sent: r.SSN_Sent,
          Offer_Sent: r.Offer_Sent,
          Offer_Signed: r.Offer_Signed
        }));
        setRows(mapped);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  const handleRowUpdate = async (newRow) => {
    try {
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${newRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Position_Number: newRow.Position_Number,
          I9_Sent: newRow.i9_Sent ?? false,
          SSN_Sent: newRow.ssn_Sent ?? false,
          Offer_Sent: newRow.offer_Sent ?? false,
          Offer_Signed: newRow.offer_Signed ?? false
        })
      });
  
      if (!response.ok) throw new Error('Failed to update position number');
  
      return newRow; // ✅ let DataGrid know update succeeded
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
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
      <Paper elevation={0} style={{ height: 'fit-content', width: '100%', padding: 10 }}>
        <Typography variant="h5" gutterBottom>
          Master Dashboard
        </Typography>
        <DataGrid
          sx={{
            '& .MuiDataGrid-cell': {
              textAlign: 'center',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              fontSize: '1.1em',
            },
          }}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel:{pageSize: 25, page: 0},
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableSelectionOnClick
          showToolbar
          allowColumnReordering={true}
          processRowUpdate={handleRowUpdate}
        />
      </Paper>

      {/* ✅ Modal for Review */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Review Assignment: {selectedRow?.studentName}</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox 
                name="I9_Sent" 
                checked={reviewStatus.I9_Sent} 
                onChange={handleCheckboxChange} />}
                label="I-9 Sent"
            />
            <FormControlLabel
              control={<Checkbox 
                name="SSN_Sent" 
                checked={reviewStatus.SSN_Sent} 
                onChange={handleCheckboxChange} />}
                label="SSN Sent"
            />
            <FormControlLabel
              control={<Checkbox 
                name="Offer_Sent" 
                checked={reviewStatus.Offer_Sent} 
                onChange={handleCheckboxChange} />}
                label="Offer Sent"
            />
            <FormControlLabel
              control={<Checkbox 
                name="Offer_Signed" 
                checked={reviewStatus.Offer_Signed} 
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
    </>
  );
}
