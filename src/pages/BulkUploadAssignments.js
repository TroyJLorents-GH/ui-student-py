// This allowes for collobrate sql or just enter the og 5 headers and upload the file. Most likely will use this one

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Typography, Button, Paper, Box, Snackbar, Alert
} from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';

const columnMapping = {
  'Position': 'Position',
  'FultonFellow': 'FultonFellow',
  'WeeklyHours': 'WeeklyHours',
  'Student_ID (ID number OR ASUrite accepted)': 'Student_ID',
  'ClassNum': 'ClassNum'
};

const baseUrl = process.env.REACT_APP_API_URL;

const BulkUploadAssignments = () => {
  const [rows, setRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);

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
      setPreviewRows([]); // Clear preview until calibrated
    };
    reader.readAsBinaryString(file);
  };

  // Calibrate preview: POST CSV to backend, get enriched preview
  const handleCalibrate = async () => {
    try {
      if (!file) throw new Error("No file selected.");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/calibrate-preview`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Calibration failed');
      }
      const data = await response.json();
      setPreviewRows(data);
      setSnackbar({ open: true, message: 'Preview loaded!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Final database upload
  const handleUpload = async () => {
    try {
      if (!file) throw new Error("No file selected.");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Upload failed');
      }
      setSnackbar({ open: true, message: 'Upload successful!', severity: 'success' });
      setRows([]);
      setPreviewRows([]);
      setFile(null);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Bulk Upload Student Assignments
      </Typography>

      {/* Download and Upload side-by-side */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          component="a"
          href={`${baseUrl}/api/StudentClassAssignment/template`}
          download="BulkUploadTemplate.csv"
        >
          DOWNLOAD CSV TEMPLATE
        </Button>
        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
          UPLOAD CSV File
          <input type="file" hidden accept=".xlsx,.csv" onChange={handleFile} />
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => { setRows([]); setPreviewRows([]); setFile(null); }}
        >
          RESET
        </Button>
      </Box>

      {/* Show initial 5-column preview if file is uploaded, and calibration hasn't run yet */}
      {rows.length > 0 && previewRows.length === 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Preview ({rows.length} row{rows.length === 1 ? '' : 's'})
          </Typography>
          <Box sx={{
            width: '100%',
            minWidth: 600,
            maxWidth: '100vw',
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}>
            <DataGridPro
              rows={rows.map((row, idx) => ({ ...row, id: row.id ?? idx }))}
              columns={[
                { field: 'Position', headerName: 'Position', width: 110 },
                { field: 'FultonFellow', headerName: 'Fulton Fellow', width: 130 },
                { field: 'WeeklyHours', headerName: 'Weekly Hours', width: 130 },
                { field: 'Student_ID', headerName: 'Student ID/ASUrite', width: 180 },
                { field: 'ClassNum', headerName: 'Class Number', width: 140 },
              ]}
              density="compact"
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="info"
              onClick={handleCalibrate}
            >
              Request SQL Calibrate
            </Button>
            <Button
              variant="contained"
              color="success"
              endIcon={<SendIcon />}
              onClick={handleUpload}
            >
              Submit to Database
            </Button>
          </Box>
        </>
      )}

      {/* Show full preview after calibration */}
      {previewRows.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Calibrated Preview ({previewRows.length} row{previewRows.length === 1 ? '' : 's'})
          </Typography>
          <Box sx={{
            width: '100%',
            minWidth: 1200,
            maxWidth: '100vw',
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}>
            <DataGridPro
             sx={{
                '& .MuiDataGrid-cell': { textAlign: 'center' },
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '1.1em', textAlign: 'center' },
                '& .highlight-cell': {
                  backgroundColor: '#fff9c4',
                  fontWeight: 600,
                },
              }}
              rows={previewRows.map((row, idx) => ({
                ...row,
                id: row.id ?? idx,
                cum_gpa: row.cum_gpa !== undefined && row.cum_gpa !== null
                  ? Number(row.cum_gpa).toFixed(2)
                  : '',
                cur_gpa: row.cur_gpa !== undefined && row.cur_gpa !== null
                  ? Number(row.cur_gpa).toFixed(2)
                  : '',
                InstructorName: row.InstructorFirstName && row.InstructorLastName
                  ? `${row.InstructorFirstName} ${row.InstructorLastName}`.trim()
                  : (row.InstructorFirstName || '') + (row.InstructorLastName || ''),
              }))}
              columns={[
                { field: 'Position', headerName: 'Position', width: 90, headerAlign: 'center' },
                { field: 'FultonFellow', headerName: 'Fulton Fellow', width: 110, headerAlign: 'center' },
                { field: 'WeeklyHours', headerName: 'Weekly Hours', width: 110, headerAlign: 'center' },
                { field: 'Student_ID', headerName: 'Student ID', width: 110, headerAlign: 'center' },
                { field: 'ASUrite', headerName: 'ASUrite', width: 110, headerAlign: 'center' },
                { field: 'First_Name', headerName: 'First Name', width: 120, headerAlign: 'center' },
                { field: 'Last_Name', headerName: 'Last Name', width: 120,  headerAlign: 'center' },
                { field: 'ASU_Email_Adress', headerName: 'ASU Email', width: 170, headerAlign: 'center' },            
                { field: 'ClassNum', headerName: 'Class Number', width: 110, headerAlign: 'center' },
                { field: 'Degree', headerName: 'Degree', width: 90, headerAlign: 'center' },
                { field: 'cum_gpa', headerName: 'Cumulative GPA', width: 130, headerAlign: 'center' },
                { field: 'cur_gpa', headerName: 'Current GPA', width: 120, headerAlign: 'center' },
                { field: 'Subject', headerName: 'Subject', width: 90, headerAlign: 'center' },
                { field: 'CatalogNum', headerName: 'Catalog #', width: 95, headerAlign: 'center' },
                { field: 'SectionNum', headerName: 'Section #', width: 95, headerAlign: 'center' },
                { field: 'Title', headerName: 'Title', width: 180, headerAlign: 'center', maxWidth: 200, flex: 1 },
                { field: 'Session', headerName: 'Session', width: 90 },
                { field: 'InstructorID', headerName: 'Instructor ID', width: 120, headerAlign: 'center' },
                {
                  field: 'InstructorName',
                  headerName: 'Instructor Name',
                  width: 170,
                  headerAlign: 'center',
                  // No need for valueGetter, already merged above
                },
                //{ field: 'InstructorEmail', headerName: 'Instructor Email', width: 160 },
                //{ field: 'Location', headerName: 'Location', width: 100 },
                //{ field: 'Campus', headerName: 'Campus', width: 90 },
                // { field: 'AcadCareer', headerName: 'Acad Career', width: 120 },
              ]}
              showToolbar
              // density="compact"
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              rowReordering
              headerFilters
              headerAlign="center"
            />
          </Box>
          <Button
            variant="contained"
            color="success"
            onClick={handleUpload}
            sx={{ mt: 2 }}
          >
            Submit to Database
          </Button>
        </>
      )}

      {/* Snackbar for feedback */}
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
