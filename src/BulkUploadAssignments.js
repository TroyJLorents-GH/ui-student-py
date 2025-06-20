import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Typography, Button, Paper, Box, Table, TableHead, TableRow,
  TableCell, TableBody, Snackbar, Alert
} from '@mui/material';


const columnMapping = {
  'Position': 'Position',
  'FultonFellow': 'FultonFellow',
  'WeeklyHours': 'WeeklyHours',
  'Student_ID': 'Student_ID',
  'First_Name': 'First_Name',
  'Last_Name': 'Last_Name',
  'Email': 'Email',
  'EducationLevel': 'EducationLevel',
  'Subject': 'Subject',
  'CatalogNum': 'CatalogNum',
  'InstructorFirstName': 'InstructorFirstName',
  'InstructorLastName': 'InstructorLastName',
  'ClassSession': 'ClassSession'
};

const baseUrl = process.env.REACT_APP_API_URL;

if (!baseUrl) {
  console.error("REACT_APP_API_URL is not defined. Make sure it's set in your .env file.");
}

const BulkUploadAssignments = () => {
  const [rows, setRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const mapped = data.map(row => {
        const result = {};
        Object.keys(columnMapping).forEach(excelCol => {
          result[columnMapping[excelCol]] = row[excelCol] ?? '';
        });
        return result;
      });

      setRows(mapped);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    try {
      const fileInput = document.querySelector('input[type="file"]');
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/upload`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) throw new Error('Upload failed');
      setSnackbar({ open: true, message: 'Upload successful!', severity: 'success' });
      setRows([]);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Bulk Upload Student Assignments</Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Upload Excel (.xlsx)
          <input type="file" hidden accept=".xlsx,.csv" onChange={handleFile} />
        </Button>
      </Box>

      {rows.length > 0 && (
        <>
          <Typography variant="subtitle1">Preview ({rows.length} rows)</Typography>
          <Box sx={{ overflow: 'auto', maxHeight: 400, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(rows[0]).map(col => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((val, i) => (
                      <TableCell key={i}>{val}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Button variant="contained" color="success" onClick={handleUpload}>
            Submit to Database
          </Button>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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

export default BulkUploadAssignments;
