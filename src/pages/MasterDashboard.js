// import React, { useState, useEffect } from 'react';
// import { DataGridPro } from '@mui/x-data-grid-pro';
// import {
//   Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
//   Button, FormGroup, FormControlLabel, Checkbox
// } from '@mui/material';

// const baseUrl = process.env.REACT_APP_API_URL;

// const currencyFormatter = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
// });

// const usdPrice = {
//   type: 'number',
//   width: 130,
//   valueFormatter: (value) => currencyFormatter.format(value),
//   cellClassName: 'font-tabular-nums',
// };

// function formatToLocal(dbDate) {
//   if (!dbDate) return '';
//   if (dbDate instanceof Date) return dbDate.toLocaleString();
//   let jsIsoDate = dbDate.includes('T') ? dbDate : dbDate.replace(' ', 'T') + 'Z';
//   return new Date(jsIsoDate).toLocaleString();
// }

// export default function MasterDashboard() {
//   const [rows, setRows] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Highlighted (recently edited) assignments - pulled from localStorage
//   const [recentlyEdited, setRecentlyEdited] = useState([]);
//   // Persist reviewedRows in sessionStorage so checks survive reloads in browser session
//   const [reviewedRows, setReviewedRows] = useState(() => {
//     return JSON.parse(sessionStorage.getItem('reviewedRows') || '{}');
//   });

//   // ---- Highlight loading ----
//   useEffect(() => {
//     const highlights = JSON.parse(localStorage.getItem('recentlyEditedAssignments') || '[]');
//     setRecentlyEdited(highlights);

//     if (highlights.length > 0) {
//       const timer = setTimeout(() => {
//         setRecentlyEdited([]);
//         localStorage.removeItem('recentlyEditedAssignments');
//       }, 15000);
//       return () => clearTimeout(timer);
//     }
//   }, []);

//   // Save reviewedRows to sessionStorage when they change
//   useEffect(() => {
//     sessionStorage.setItem('reviewedRows', JSON.stringify(reviewedRows));
//   }, [reviewedRows]);

//   // Modal state for review button (unchanged)
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [reviewStatus, setReviewStatus] = useState({
//     ssn_Sent: false,
//     offer_Sent: false,
//     offer_Signed: false,
//   });

//   // NEW: handle reviewed/checkbox click
//   function handleReviewed(rowId) {
//     setReviewedRows(prev => ({ ...prev, [rowId]: true }));
//     setRecentlyEdited(prev => prev.filter(r => r.id !== rowId));
//   }

//   // DataGrid columns (with reviewed column inserted)
//   const columns = [
//     { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 300 },
//     { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', width: 140 },
//     { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', width: 100 },
//     { field: 'position', headerName: 'Position', headerAlign: 'center', width: 150 },
//     { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', width: 80 },
//     { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', width: 120 },
//     { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 220, filterable: true },
//     { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 110 },
//     { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 250 },
//     { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 100 },
//     { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 100, type: 'number' },
//     { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100 },
//     { field: 'location', headerName: 'Location', headerAlign: 'center', width: 120 },
//     { field: 'campus', headerName: 'Campus', headerAlign: 'center', width: 110 },
//     { field: 'classNum', headerName: 'Class #', headerAlign: 'center', width: 110 },
//     { field: 'cum_gpa', headerName: 'Cum GPA', headerAlign: 'center', width: 90 },
//     { field: 'cur_gpa', headerName: 'Cur GPA', headerAlign: 'center', width: 90 },
//     { field: 'costCenterKey', headerName: 'Cost Center', headerAlign: 'center', width: 160 },
//     { field: 'compensation', headerName: 'Compensation', headerAlign: 'center', ...usdPrice },
//     {
//       field: 'review',
//       headerName: 'Review',
//       headerAlign: 'center',
//       width: 100,
//       sortable: false,
//       filterable: false,
//       renderCell: (params) => (
//         <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)}>
//           Review
//         </Button>
//       ),
//     },
//     { field: 'position_Number', headerName: 'Position Number', headerAlign: 'center', width: 140, editable: true },
//     {
//       field: 'reviewed',
//       headerName: 'Reviewed',
//       width: 90,
//       type: 'boolean',
//       renderCell: (params) => (
//         <Checkbox
//           checked={!!params.row.reviewed}
//           onChange={() => handleReviewed(params.row.id)}
//           color="success"
//         />
//       ),
//       sortable: false,
//       filterable: false,
//       align: 'center',
//       headerAlign: 'center',
//     },
//     { field: 'createdAt', headerName: 'Date Created', headerAlign: 'center', width: 170 }
//   ];

//   // Handle opening the Review modal
//   function handleOpenModal(row) {
//     setSelectedRow(row);
//     setReviewStatus({
//       ssn_Sent: row.ssn_Sent ?? false,
//       offer_Sent: row.offer_Sent ?? false,
//       offer_Signed: row.offer_Signed ?? false,
//     });
//     setModalOpen(true);
//   }

//   function handleCloseModal() {
//     setModalOpen(false);
//     setSelectedRow(null);
//   }

//   function handleCheckboxChange(e) {
//     const { name, checked } = e.target;
//     setReviewStatus((prev) => ({
//       ...prev,
//       [name]: checked
//     }));
//   }

//   async function handleSaveReview() {
//     try {
//       const payload = {
//         Position_Number: selectedRow.position_Number,
//         SSN_Sent: reviewStatus.ssn_Sent,
//         Offer_Sent: reviewStatus.offer_Sent,
//         Offer_Signed: reviewStatus.offer_Signed
//       };

//       const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) throw new Error('Failed to update assignment');

//       // Re-fetch just the updated row
//       const fresh = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`).then(r => r.json());
//       setRows(prevRows =>
//         prevRows.map(row =>
//           row.id === selectedRow.id
//             ? {
//                 ...row,
//                 ssn_Sent: fresh.SSN_Sent,
//                 offer_Sent: fresh.Offer_Sent,
//                 offer_Signed: fresh.Offer_Signed,
//                 position_Number: fresh.Position_Number
//               }
//             : row
//         )
//       );

//       handleCloseModal();
//     } catch (err) {
//       console.error('Error updating assignment:', err);
//     }
//   }

//   // Handle cell/row updates for editable columns
//   const handleRowUpdate = async (newRow) => {
//     try {
//       const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${newRow.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           Position_Number: newRow.position_Number,
//           SSN_Sent: newRow.ssn_Sent ?? false,
//           Offer_Sent: newRow.offer_Sent ?? false,
//           Offer_Signed: newRow.offer_Signed ?? false
//         })
//       });

//       if (!response.ok) throw new Error('Failed to update position number');

//       return newRow; // DataGrid expects the updated row
//     } catch (error) {
//       console.error('Update failed:', error);
//       throw error;
//     }
//   };

//   // Load data from API
//   useEffect(() => {
//     setLoading(true);
//     fetch(`${baseUrl}/api/StudentClassAssignment`)
//       .then(res => {
//         if (!res.ok) throw new Error('Failed to load assignments');
//         return res.json();
//       })
//       .then(data => {
//         // Map to DataGrid format, format dates
//         const mapped = data.map(r => ({
//           id: r.Id,
//           studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`.trim(),
//           student_ID: r.Student_ID,
//           asuRite: r.ASUrite,
//           position: r.Position,
//           weeklyHours: r.WeeklyHours,
//           fultonFellow: r.FultonFellow,
//           email: r.Email,
//           educationLevel: r.EducationLevel,
//           instructorName: `${r.InstructorFirstName} ${r.InstructorLastName}`.trim(),
//           subject: r.Subject,
//           catalogNum: r.CatalogNum,
//           classSession: r.ClassSession,
//           location: r.Location,
//           campus: r.Campus,
//           classNum: r.ClassNum,
//           cum_gpa: r.cum_gpa,
//           cur_gpa: r.cur_gpa,
//           costCenterKey: r.CostCenterKey,
//           compensation: r.Compensation,
//           position_Number: r.Position_Number || '',
//           ssn_Sent: r.SSN_Sent,
//           offer_Sent: r.Offer_Sent,
//           offer_Signed: r.Offer_Signed,
//           createdAt: formatToLocal(r.CreatedAt),
//           reviewed: reviewedRows[r.Id] || false,
//         }));
//         setRows(mapped);
//         setError('');
//       })
//       .catch(err => {
//         setError(err.message);
//         setRows([]);
//       })
//       .finally(() => setLoading(false));
//   }, [reviewedRows]);

//     const getCellClassName = (params) => {
//     const edited = recentlyEdited.find(r => r.id === params.row.id);
//     if (edited) {
//       console.log('Cell:', params.field, 'Changed fields:', edited.changed_fields); // <-- Add this
//     }
//     if (params.row.reviewed) return '';
//     if (edited && edited.changed_fields && edited.changed_fields.includes(params.field)) {
//       return 'highlight-cell';
//     }
//     return '';
//   };

//   if (error) {
//     return (
//       <Paper style={{ padding: 16, margin: 20 }}>
//         <Typography color="error">Error: {error}</Typography>
//       </Paper>
//     );
//   }

//   return (
//     <>
//       <div style={{ height: 'fit-content', width: '100%' }}>
//         <Typography variant="h5" gutterBottom>
//           Master Dashboard
//         </Typography>
//         <DataGridPro
//           sx={{
//             '& .MuiDataGrid-cell': { textAlign: 'center' },
//             '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.1em' },
//             '& .highlight-cell': {
//               backgroundColor: '#fff9c4',
//               fontWeight: 600,
//             },
//           }}
//           pagination
//           rows={rows}
//           columns={columns}
//           getCellClassName={getCellClassName}
//           loading={loading}
//           initialState={{
//             pagination: { paginationModel: { pageSize: 25, page: 0 } },
//           }}
//           pageSizeOptions={[25, 50, 100]}
//           disableSelectionOnClick
//           allowColumnReordering
//           showToolbar
//           headerFilters
//           processRowUpdate={handleRowUpdate}
//         />
//       </div>

//       {/* Modal Review */}
//       <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
//         <DialogTitle>Review Assignment: {selectedRow?.studentName}</DialogTitle>
//         <DialogContent>
//           <FormGroup>
//             <FormControlLabel
//               control={<Checkbox
//                 name="ssn_Sent"
//                 checked={reviewStatus.ssn_Sent}
//                 onChange={handleCheckboxChange} />}
//               label="SSN Sent"
//             />
//             <FormControlLabel
//               control={<Checkbox
//                 name="offer_Sent"
//                 checked={reviewStatus.offer_Sent}
//                 onChange={handleCheckboxChange} />}
//               label="Offer Sent"
//             />
//             <FormControlLabel
//               control={<Checkbox
//                 name="offer_Signed"
//                 checked={reviewStatus.offer_Signed}
//                 onChange={handleCheckboxChange} />}
//               label="Offer Signed"
//             />
//           </FormGroup>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseModal}>Cancel</Button>
//           <Button onClick={handleSaveReview} variant="contained">Save</Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }





import React, { useState, useEffect } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';

const baseUrl = process.env.REACT_APP_API_URL;

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

  // Read and persist highlights & reviewed state
  const [recentlyEdited, setRecentlyEdited] = useState(() => {
    return JSON.parse(localStorage.getItem('recentlyEditedAssignments') || '[]');
  });
  const [reviewedRows, setReviewedRows] = useState(() => {
    return JSON.parse(localStorage.getItem('reviewedRows') || '{}');
  });

  // Keep recentlyEdited in sync with localStorage when changed elsewhere
  useEffect(() => {
    const handler = () => {
      setRecentlyEdited(JSON.parse(localStorage.getItem('recentlyEditedAssignments') || '[]'));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Save reviewedRows to localStorage when changed
  useEffect(() => {
    localStorage.setItem('reviewedRows', JSON.stringify(reviewedRows));
  }, [reviewedRows]);

  // Modal state for review button (unchanged)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [reviewStatus, setReviewStatus] = useState({
    ssn_Sent: false,
    offer_Sent: false,
    offer_Signed: false,
  });

  // --- "Reviewed" checkbox logic ---
  function handleReviewed(rowId) {
    setReviewedRows(prev => {
      // Remove highlight from that row only
      const updated = { ...prev, [rowId]: true };
      // Also remove from recentlyEdited
      const newRecentlyEdited = recentlyEdited.filter(r => r.id !== rowId);
      setRecentlyEdited(newRecentlyEdited);
      localStorage.setItem('recentlyEditedAssignments', JSON.stringify(newRecentlyEdited));
      return updated;
    });
  }

  // DataGrid columns (with reviewed column inserted)
  const columns = [
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
      width: 85,
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
    },
    { field: 'createdAt', headerName: 'Date Created', headerAlign: 'center', width: 170 }
  ];

  // Handle opening the Review modal
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
        Offer_Signed: reviewStatus.offer_Signed
      };

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      // Re-fetch just the updated row
      const fresh = await fetch(`${baseUrl}/api/StudentClassAssignment/${selectedRow.id}`).then(r => r.json());
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRow.id
            ? {
                ...row,
                ssn_Sent: fresh.SSN_Sent,
                offer_Sent: fresh.Offer_Sent,
                offer_Signed: fresh.Offer_Signed,
                position_Number: fresh.Position_Number
              }
            : row
        )
      );

      handleCloseModal();
    } catch (err) {
      console.error('Error updating assignment:', err);
    }
  }

  // Handle cell/row updates for editable columns
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

      return newRow; // DataGrid expects the updated row
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  // Load data from API
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/StudentClassAssignment`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        // Map to DataGrid format, format dates
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

  // --- Highlight cells only if not reviewed and in recentlyEdited ---
  const getCellClassName = (params) => {
    if (reviewedRows[params.row.id]) return '';
    const edited = recentlyEdited.find(r => r.id === params.row.id);
    if (edited && edited.changed_fields && edited.changed_fields.includes(params.field)) {
      return 'highlight-cell';
    }
    return '';
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
      <div style={{ height: 'fit-content', width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Master Dashboard
        </Typography>
        <DataGridPro
          sx={{
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.1em' },
            '& .highlight-cell': {
              backgroundColor: '#fff9c4',
              fontWeight: 600,
            },
          }}
          pagination
          rows={rows}
          columns={columns}
          getCellClassName={getCellClassName}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableSelectionOnClick
          allowColumnReordering
          showToolbar
          // rowReordering
          headerFilters
          processRowUpdate={handleRowUpdate}
        />
      </div>

      {/* Modal Review */}
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
    </>
  );
}