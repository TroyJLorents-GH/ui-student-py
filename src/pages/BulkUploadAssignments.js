// This allowes for collobrate sql or just enter the og 5 headers and upload the file. Most likely will use this one

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Typography, Button, Paper, Box, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';

const columnMapping5Header = {
  'Position': 'Position',
  'FultonFellow': 'FultonFellow',
  'WeeklyHours': 'WeeklyHours',
  'Student_ID (ID number OR ASUrite accepted)': 'Student_ID',
  'ClassNum': 'ClassNum',
  'Status': 'Status'
};

const columnMapping12Header = {
  'Position': 'Position',
  'FultonFellow': 'FultonFellow',
  'WeeklyHours': 'WeeklyHours',
  'Student_ID (ID number OR ASUrite accepted)': 'Student_ID',
  'First_Name': 'First_Name',
  'Last_Name': 'Last_Name',
  'Email': 'Email',
  'EducationLevel': 'EducationLevel',
  'Subject': 'Subject',
  'CatalogNum': 'CatalogNum',
  'ClassSession': 'ClassSession',
  'ClassNum': 'ClassNum',
  'Status': 'Status'
};

const baseUrl = process.env.REACT_APP_API_URL;

const POSITIONS = ['TA', 'IA', 'Grader', 'TA (GSA) 1 credit', 'TA (GSA) 1 credit +'];
const CURRENT_TERM = '2264'; // Default term — summer (ends in 4) allows up to 40hr/wk
const HOURS = [5, 10, 15, 20];
const HOURS_SUMMER = [5, 10, 15, 20, 25, 30, 35, 40];
// Summer terms (code ends in 4) cap at 40hr/wk; spring (1) and fall (7) stay 20.
const HOURS_OPTIONS = String(CURRENT_TERM).endsWith('4') ? HOURS_SUMMER : HOURS;

const BulkUploadAssignments = () => {
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [file, setFile] = useState(null);
  const [isLegacyFormat, setIsLegacyFormat] = useState(false);
  const [editedCells, setEditedCells] = useState(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);

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

      // Detect format by checking if legacy fields exist
      if (data.length > 0) {
        const firstRow = data[0];
        const hasLegacyFields = 'First_Name' in firstRow && 'Last_Name' in firstRow && 'Email' in firstRow;
        setIsLegacyFormat(hasLegacyFields);

        // Use appropriate column mapping
        const columnMapping = hasLegacyFields ? columnMapping12Header : columnMapping5Header;

        const mapped = data.map((row, idx) => {
          const result = { id: idx };
          Object.keys(columnMapping).forEach(excelCol => {
            result[columnMapping[excelCol]] = row[excelCol] ?? '';
          });
          return result;
        });

        setRows(mapped);
      } else {
        setRows([]);
      }
      setPreviewRows([]); // Clear preview until calibrated
    };
    reader.readAsBinaryString(file);
  };

  // Calibrate preview: POST CSV to backend, get enriched preview
  const handleCalibrate = async () => {
    try {
      if (!file && rows.length === 0) throw new Error("No file selected.");

      // If rows have been edited, convert them back to CSV
      let fileToUpload = file;
      if (rows.length > 0) {
        // Get column headers based on format
        const headers = isLegacyFormat
          ? Object.keys(columnMapping12Header)
          : Object.keys(columnMapping5Header);

        // Create CSV content
        const csvRows = [headers.join(',')];
        rows.forEach(row => {
          const values = headers.map(header => {
            const fieldName = isLegacyFormat
              ? columnMapping12Header[header]
              : columnMapping5Header[header];
            let value = row[fieldName] ?? '';
            // Clean newlines and carriage returns from values
            if (typeof value === 'string') {
              value = value.replace(/[\r\n]+/g, ' ').trim();
            }
            // Escape values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvRows.push(values.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        fileToUpload = new File([blob], file?.name || 'upload.csv', { type: 'text/csv' });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/calibrate-preview`, {
        method: 'POST',
        credentials: 'include',
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
      if (!file && rows.length === 0) throw new Error("No file selected.");

      // If rows have been edited, convert them back to CSV
      let fileToUpload = file;
      if (rows.length > 0) {
        // Get column headers based on format
        const headers = isLegacyFormat
          ? Object.keys(columnMapping12Header)
          : Object.keys(columnMapping5Header);

        // Create CSV content
        const csvRows = [headers.join(',')];
        rows.forEach(row => {
          const values = headers.map(header => {
            const fieldName = isLegacyFormat
              ? columnMapping12Header[header]
              : columnMapping5Header[header];
            let value = row[fieldName] ?? '';
            // Clean newlines and carriage returns from values
            if (typeof value === 'string') {
              value = value.replace(/[\r\n]+/g, ' ').trim();
            }
            // Escape values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvRows.push(values.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        fileToUpload = new File([blob], file?.name || 'upload.csv', { type: 'text/csv' });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Upload failed');
      }
      const result = await response.json();
      setSnackbar({ open: true, message: result.message || 'Upload successful!', severity: 'success' });
      setRows([]);
      setPreviewRows([]);
      setFile(null);
      setIsLegacyFormat(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Bulk Upload Student Assignments
      </Typography>

      {/* Helper text for Status column */}
      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant='body1'>
            <strong>Status Column Guide (for reusing the same template):</strong> Mark previously uploaded rows as <strong>'Uploaded'</strong> to skip them. New rows can be left <strong>blank</strong> or marked <strong>'New'</strong>.
          </Typography>
          <Button
            size="small"
            variant="contained"
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => setExampleModalOpen(true)}
          >
            View Example
          </Button>
        </Box>
      </Alert>

      {/* Download and Upload side-by-side */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          component="a"
          href={`${baseUrl}/api/StudentClassAssignment/template`}
          download="BulkUploadTemplate.csv"
           sx={{
              backgroundColor: '#FFC627',
              color: '#000000', // black text per ASU style contrast
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#cf9e16', // darker gold on hover
              },
            }}
        >
          DOWNLOAD SAMS TEMPLATE (6 Fields)
        </Button>
        <Button
          variant="outlined"
          component="a"
          href={`${baseUrl}/api/StudentClassAssignment/template-legacy`}
          download="BulkUploadTemplate_Legacy.csv"
           sx={{
              backgroundColor: '#000000',
              color: '#FFC627', // gold text on black background
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1a1a1a', // slightly lighter black on hover
              },
            }}
        >
          DOWNLOAD LEGACY TEMPLATE (13 Fields)
        </Button>
        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}
          sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' },
          }}>
          SELECT CSV File
          <input ref={fileInputRef} type="file" hidden accept=".xlsx,.csv" onChange={handleFile} />
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setRows([]);
            setPreviewRows([]);
            setFile(null);
            setIsLegacyFormat(false);
            setEditedCells(new Set());
            if (fileInputRef.current) {
              fileInputRef.current.value = ''; // Clear file input
            }
          }}
        >
          RESET
        </Button>
      </Box>

      {/* Show initial preview if file is uploaded, and calibration hasn't run yet */}
      {rows.length > 0 && previewRows.length === 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Preview ({rows.length} row{rows.length === 1 ? '' : 's'}) - {isLegacyFormat ? 'Legacy 12-Header' : 'New 5-Header'} Format
          </Typography>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
            Double-click any cell to edit its value
          </Typography>
          <Box sx={{
            width: '100%',
            minWidth: isLegacyFormat ? 1200 : 600,
            maxWidth: '100vw',
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}>
            <DataGridPro
              rows={rows}
              columns={
                isLegacyFormat ? [
                  { field: 'Position', headerName: 'Position', width: 140, editable: true, type: 'singleSelect', valueOptions: POSITIONS },
                  { field: 'FultonFellow', headerName: 'Fulton Fellow', width: 120, editable: true },
                  { field: 'WeeklyHours', headerName: 'Hours', width: 100, editable: true, type: 'singleSelect', valueOptions: HOURS_OPTIONS },
                  { field: 'Student_ID', headerName: 'Student ID', width: 120, editable: true },
                  { field: 'First_Name', headerName: 'First Name', width: 120, editable: true },
                  { field: 'Last_Name', headerName: 'Last Name', width: 120, editable: true },
                  { field: 'Email', headerName: 'Email', width: 200, editable: true },
                  { field: 'EducationLevel', headerName: 'Degree', width: 100, editable: true },
                  { field: 'Subject', headerName: 'Subject', width: 90, editable: true },
                  { field: 'CatalogNum', headerName: 'Catalog#', width: 90, editable: true },
                  { field: 'ClassSession', headerName: 'Session', width: 90, editable: true },
                  { field: 'ClassNum', headerName: 'Class#', width: 100, editable: true },
                  { field: 'Status', headerName: 'Status', width: 100, editable: true },
                ] : [
                  { field: 'Position', headerName: 'Position', width: 140, editable: true, type: 'singleSelect', valueOptions: POSITIONS },
                  { field: 'FultonFellow', headerName: 'Fulton Fellow', width: 130, editable: true },
                  { field: 'WeeklyHours', headerName: 'Weekly Hours', width: 130, editable: true, type: 'singleSelect', valueOptions: HOURS_OPTIONS },
                  { field: 'Student_ID', headerName: 'Student ID/ASUrite', width: 180, editable: true },
                  { field: 'ClassNum', headerName: 'Class Number', width: 140, editable: true },
                  { field: 'Status', headerName: 'Status', width: 100, editable: true },
                ]
              }
              getRowClassName={(params) => {
                const status = String(params.row.Status || '').trim().toLowerCase();
                if (status === 'old' || status === 'uploaded') {
                  return 'row-skipped';
                } else if (status === 'new' || status === '') {
                  return 'row-new';
                }
                return '';
              }}
              processRowUpdate={(newRow, oldRow) => {
                // Track edited cells
                const editedCellsNew = new Set(editedCells);
                Object.keys(newRow).forEach(field => {
                  if (field !== 'id' && newRow[field] !== oldRow[field]) {
                    editedCellsNew.add(`${newRow.id}-${field}`);
                  }
                });
                setEditedCells(editedCellsNew);

                const updatedRows = rows.map((row) =>
                  row.id === newRow.id ? newRow : row
                );
                setRows(updatedRows);
                return newRow;
              }}
              onProcessRowUpdateError={(error) => {
                setSnackbar({ open: true, message: `Error updating row: ${error.message}`, severity: 'error' });
              }}
              getCellClassName={(params) => {
                if (editedCells.has(`${params.id}-${params.field}`)) {
                  return 'edited-cell';
                }
                return '';
              }}
              sx={{
                '& .edited-cell': {
                  backgroundColor: '#fff3cd',
                  fontWeight: 600,
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#f9f9f9',
                },
                '& .row-new': {
                  backgroundColor: '#e8f5e9 !important',
                  '&:hover': {
                    backgroundColor: '#c8e6c9 !important',
                  },
                },
                '& .row-skipped': {
                  backgroundColor: '#f5f5f5 !important',
                  opacity: 0.7,
                  '&:hover': {
                    backgroundColor: '#eeeeee !important',
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#8c1d40',
                  color: '#000000ff',
                  fontWeight: 'bold',
                  zIndex: 1,
                },
              }}
              density="compact"
              autoHeight
              headerFilters
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              columnHeaderHeight={56}
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
              onClick={() => setConfirmDialogOpen(true)}
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
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#f9f9f9',
                },
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#8c1d40',
                  color: '#000000ff',
                  fontWeight: 'bold',
                  zIndex: 1,
                },
                '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
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
                { field: 'Last_Name', headerName: 'Last Name', width: 120, headerAlign: 'center' },
                //{ field: 'ASU_Email_Adress', headerName: 'ASU Email', width: 170 },
                { field: 'Degree', headerName: 'Degree', width: 90, headerAlign: 'center' },
                { field: 'cum_gpa', headerName: 'Cumulative GPA', width: 130, headerAlign: 'center' },
                //{ field: 'cur_gpa', headerName: 'Current GPA', width: 120, headerAlign: 'center' },
                { field: 'ClassNum', headerName: 'Class Number', width: 110, headerAlign: 'center' },
                { field: 'Subject', headerName: 'Subject', width: 90, headerAlign: 'center' },
                { field: 'CatalogNum', headerName: 'Catalog #', width: 95, headerAlign: 'center' },
                { field: 'SectionNum', headerName: 'Section #', width: 95, headerAlign: 'center' },
                //{ field: 'Title', headerName: 'Title', width: 180, maxWidth: 200, flex: 1 },
                //{ field: 'Term', headerName: 'Term', width: 80 },
                { field: 'Session', headerName: 'Session', width: 90, headerAlign: 'center' },
                { field: 'InstructorID', headerName: 'Instructor ID', width: 120, headerAlign: 'center' },
                {
                  field: 'InstructorName',
                  headerName: 'Instructor Name',
                  width: 170,
                  headerAlign: 'center'
                  // No need for valueGetter, already merged above
                },
               // { field: 'InstructorEmail', headerName: 'Instructor Email', width: 160 },
                { field: 'Location', headerName: 'Location', width: 100, headerAlign: 'center' },
                //{ field: 'Campus', headerName: 'Campus', width: 90 },
                { field: 'AcadCareer', headerName: 'Acad Career', width: 120, headerAlign: 'center' },
                //{ field: 'CombineSectionID', headerName: 'Combine Section ID', width: 150, maxWidth: 160 },
                { field: 'Component', headerName: 'Component', width: 110, headerAlign: 'center' },
                //{ field: 'EndDate', headerName: 'End Date', width: 110 },
                { field: 'EnrollTotal', headerName: 'Enroll Total', width: 110 },
                { field: 'EnrollCap', headerName: 'Enroll Cap', width: 110 },
                { field: 'InstructMode', headerName: 'Instruction Mode', width: 140, headerAlign: 'center' },
                { field: 'Status', headerName: 'Status', width: 90, headerAlign: 'center' },
              ]}
              density="compact"
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              showToolbar
              rowReordering
              headerFilters
              columnHeaderHeight={56}
            />
          </Box>
          <Button
            variant="contained"
            color="success"
            endIcon={<SendIcon />}
            onClick={() => setConfirmDialogOpen(true)}
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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity || 'success'}
          variant='filled'
          sx={{
            fontSize: '.9rem',
            minWidth: '400px',
            '& .MuiAlert-message': {
              fontSize: '1.0rem',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to submit {rows.length} assignment{rows.length === 1 ? '' : 's'} to the database?
            {editedCells.size > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 2, fontWeight: 'bold', color: '#8c1d40' }}>
                Note: {editedCells.size} cell{editedCells.size === 1 ? ' has' : 's have'} been edited.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              handleUpload();
            }}
            variant="contained"
            sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' },
            }}
            autoFocus
          >
            Confirm Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Example Modal Dialog */}
      <Dialog
        open={exampleModalOpen}
        onClose={() => setExampleModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Status Column Example
          <Button
            size="small"
            onClick={() => setExampleModalOpen(false)}
            sx={{ minWidth: 'auto' }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          <img
            src="/status-column-example.jpg"
            alt="Status Column Example"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
          />
          <Box sx={{ mt: 2, textAlign: 'left', color: 'text.secondary' }}>
            <Typography variant="body2">
              <strong>Example Guide:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Rows 2-8: Marked as <strong>'Uploaded'</strong> - these rows will be skipped during upload
            </Typography>
            <Typography variant="body2">
              • Rows 9-13: Status column is blank - these new rows will be uploaded
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default BulkUploadAssignments;

