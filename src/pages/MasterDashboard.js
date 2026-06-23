import React, { useState, useEffect, useMemo } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import {
  Paper, Typography, Snackbar, Alert, Box,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CustomToolbar, CustomToolbarWithPivot, getDataGridSx as getBaseDataGridSx } from '../utils/dataGridStyles';
import { TERM_OPTIONS } from '../constants/terms';

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

// Extends the shared DataGrid styles with MasterDashboard-specific row classes
function getDataGridSx(theme) {
  return {
    ...getBaseDataGridSx(theme),
    '& .deleted-row': {
      backgroundColor: '#ffebee',
      '& .MuiDataGrid-cell': { color: theme.palette.error.main },
      '&:hover': { backgroundColor: '#ffcdd2' },
    },
    '& .edited-row': {
      backgroundColor: '#fff3e0',
      '& .MuiDataGrid-cell': { color: '#e65100' },
      '&:hover': { backgroundColor: '#ffe0b2' },
    },
  };
}

export default function MasterDashboard() {
  const theme = useTheme();
  const dataGridSx = useMemo(() => getDataGridSx(theme), [theme]);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState('current');

  // Offer letter preview modal state
  const [offerLetterModal, setOfferLetterModal] = useState({
    open: false,
    loading: false,
    pdfUrl: null,
    filename: '',
    row: null,
  });

  const handlePreviewOfferLetter = async (row) => {
    setOfferLetterModal({ open: true, loading: true, pdfUrl: null, filename: '', row });
    try {
      const res = await fetch(`${baseUrl}/api/offer-letter/${row.id}`, { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed (${res.status})`);
      }
      const blob = await res.blob();
      const disp = res.headers.get('content-disposition') || '';
      // Prefer RFC 5987 filename*= (UTF-8 encoded), fall back to quoted filename=
      let filename = null;
      const starMatch = disp.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);
      if (starMatch) {
        try { filename = decodeURIComponent(starMatch[1].trim()); } catch { /* ignore */ }
      }
      if (!filename) {
        const quotedMatch = disp.match(/filename\s*=\s*"([^"]+)"/i);
        if (quotedMatch) filename = quotedMatch[1];
      }
      if (!filename) {
        // Final fallback: match backend format "{Last}, {First} TERM Position.pdf"
        const termShort = row.term?.endsWith('4') ? `SUM'${row.term.slice(1, 3)}`
                        : row.term?.endsWith('7') ? `FA'${row.term.slice(1, 3)}`
                        : row.term?.endsWith('1') ? `SP'${row.term.slice(1, 3)}`
                        : row.term || '';
        filename = `${row.lastName}, ${row.firstName} ${termShort} ${row.position}.pdf`;
      }
      const url = URL.createObjectURL(blob);
      setOfferLetterModal({ open: true, loading: false, pdfUrl: url, filename, row });
    } catch (err) {
      setOfferLetterModal({ open: false, loading: false, pdfUrl: null, filename: '', row: null });
      setSnackbar({ open: true, message: `Offer letter failed: ${err.message}`, severity: 'error' });
    }
  };

  const handleCloseOfferLetter = () => {
    if (offerLetterModal.pdfUrl) URL.revokeObjectURL(offerLetterModal.pdfUrl);
    setOfferLetterModal({ open: false, loading: false, pdfUrl: null, filename: '', row: null });
  };

  const handleDownloadOfferLetter = async () => {
    if (!offerLetterModal.pdfUrl) return;
    const link = document.createElement('a');
    link.href = offerLetterModal.pdfUrl;
    link.download = offerLetterModal.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const row = offerLetterModal.row;
    if (row && !row.offer_Sent) {
      try {
        await fetch(`${baseUrl}/api/offer-letter/${row.id}/mark-sent`, {
          method: 'POST',
          credentials: 'include',
        });
        setRows(prev => prev.map(r => (
          r.id === row.id ? { ...r, offer_Sent: new Date().toISOString() } : r
        )));
      } catch (err) {
        console.error('Failed to mark offer as sent:', err);
      }
    }
  };

  // ── Batch download state ──
  // MUI X DataGrid v8: rowSelectionModel = { type: 'include' | 'exclude', ids: Set<id> }
  const [graderSelection, setGraderSelection] = useState({ type: 'include', ids: new Set() });
  const [iaSelection, setIaSelection] = useState({ type: 'include', ids: new Set() });
  const [batchDownloading, setBatchDownloading] = useState(false);

  const handleBatchDownload = async (ids) => {
    if (!ids?.length) return;
    setBatchDownloading(true);
    try {
      const res = await fetch(`${baseUrl}/api/offer-letter/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed (${res.status})`);
      }
      const blob = await res.blob();
      const disp = res.headers.get('content-disposition') || '';
      const m = disp.match(/filename\s*=\s*"?([^";]+)"?/i);
      const filename = m ? m[1].trim() : `OfferLetters_${new Date().toISOString().slice(0, 10)}.zip`;

      const successIds = (res.headers.get('x-batch-success-ids') || '').split(',').filter(Boolean).map(Number);
      const successCount = parseInt(res.headers.get('x-batch-success-count') || '0', 10);
      const failureCount = parseInt(res.headers.get('x-batch-failure-count') || '0', 10);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mark rows as generated
      const successSet = new Set(successIds);
      const now = new Date().toISOString();
      setRows(prev => prev.map(r => (
        successSet.has(r.id) && !r.offer_Sent ? { ...r, offer_Sent: now } : r
      )));

      setSnackbar({
        open: true,
        message: failureCount > 0
          ? `Downloaded ${successCount} letters, ${failureCount} failed`
          : `Downloaded ${successCount} letters`,
        severity: failureCount > 0 ? 'warning' : 'success',
      });
    } catch (err) {
      setSnackbar({ open: true, message: `Batch failed: ${err.message}`, severity: 'error' });
    } finally {
      setBatchDownloading(false);
    }
  };

  // Term options shared with Admin Analytics — see src/constants/terms.js

  // ── Tab 1 Columns (Full Master Dashboard) ──
  const tab1Columns = [
    // ─── Visible by default (in display order) ───
    { field: 'id', headerName: 'Confirmation #', headerAlign: 'center', flex: 0.8, minWidth: 100, type: 'number', valueFormatter: (value) => String(value) },
    { field: 'notes', headerName: 'Notes', headerAlign: 'center', flex: 2, minWidth: 200, editable: true },
    { field: 'status', headerName: 'Status', headerAlign: 'center', flex: 1, minWidth: 120, editable: true },
    { field: 'jobRequisition', headerName: 'Job Req', headerAlign: 'center', flex: 0.9, minWidth: 110, editable: true },
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1.4, minWidth: 130 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.9, minWidth: 100 },
    { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', flex: 1, minWidth: 110 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', flex: 0.5, minWidth: 60, type: 'number' },
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
    { field: 'classNum', headerName: 'Class #', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'costCenterKey', headerName: 'Cost Center', headerAlign: 'center', flex: 1, minWidth: 120 },
    { field: 'position_Number', headerName: 'Position Num', headerAlign: 'center', flex: 0.9, minWidth: 130, editable: true },
    { field: 'createdAt', headerName: 'Date Created', headerAlign: 'center', flex: 1.25, minWidth: 130 },

    // ─── Hidden by default — selectable via "Select Columns" ───
    { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', flex: 0.8, minWidth: 90 },
    { field: 'campus', headerName: 'Campus', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'compensation', headerName: 'Compensation', headerAlign: 'center', flex: 0.8, minWidth: 100, type: 'number', valueFormatter: (value) => currencyFormatter.format(value), cellClassName: 'font-tabular-nums' },
    { field: 'market', headerName: 'Resident Type', headerAlign: 'center', flex: 0.8, minWidth: 100 },
    { field: 'residency', headerName: 'Residency', headerAlign: 'center', flex: 0.8, minWidth: 100 },
    { field: 'importedBy', headerName: 'Imported By', headerAlign: 'center', flex: 0.8, minWidth: 90 },
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
  ];

  // ── Shared columns for slim views (Tab 2-5) ──
  const slimColumns = [
    { field: 'id', headerName: 'Confirmation Num', headerAlign: 'center', flex: 0.8, minWidth: 100, type: 'number', valueFormatter: (value) => String(value) },
    { field: 'lastName', headerName: 'Last Name', headerAlign: 'center', flex: 1.2, minWidth: 120 },
    { field: 'firstName', headerName: 'First Name', headerAlign: 'center', flex: 1.2, minWidth: 120 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.9, minWidth: 100 },
    { field: 'classNum', headerName: 'Class #', headerAlign: 'center', flex: 0.8, minWidth: 90 },
    { field: 'term', headerName: 'Term', headerAlign: 'center', flex: 0.6, minWidth: 70 },
    {
      field: 'course',
      headerName: 'Course',
      headerAlign: 'center',
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => `${row.subject} - ${row.catalogNum}`,
    },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'instructorName', headerName: 'Instructor', headerAlign: 'center', flex: 1.2, minWidth: 130 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', flex: 1, minWidth: 110 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', flex: 0.5, minWidth: 60, type: 'number' },
    { field: 'costCenterKey', headerName: 'Cost Center', headerAlign: 'center', flex: 1, minWidth: 120 },
    { field: 'compensation', headerName: 'Compensation', headerAlign: 'center', flex: 0.8, minWidth: 100, type: 'number', valueFormatter: (value) => currencyFormatter.format(value), cellClassName: 'font-tabular-nums' },
    { field: 'notes', headerName: 'Notes', headerAlign: 'center', flex: 2, minWidth: 200, editable: true },
    { field: 'status', headerName: 'Status', headerAlign: 'center', flex: 1, minWidth: 120, editable: true },
    { field: 'jobRequisition', headerName: 'Job Req', headerAlign: 'center', flex: 0.9, minWidth: 110, editable: true },
  ];

  // Columns for Grader/IA tabs: slim columns + Market + Offer Letter action
  const graderIaColumns = useMemo(() => [
    ...slimColumns,
    { field: 'market', headerName: 'Resident Type', headerAlign: 'center', flex: 0.8, minWidth: 100 },
    {
      field: 'offerLetter',
      headerName: 'Offer Letter',
      headerAlign: 'center',
      align: 'center',
      flex: 0.8,
      minWidth: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const generated = !!params.row.offer_Sent;
        const tip = generated
          ? `Generated ${new Date(params.row.offer_Sent).toLocaleString()} — click to preview again`
          : 'Preview Offer Letter';
        return (
          <IconButton
            size="small"
            color={generated ? 'success' : 'primary'}
            title={tip}
            onClick={() => handlePreviewOfferLetter(params.row)}
          >
            {generated ? <CheckCircleIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />}
          </IconButton>
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // ── Filtered rows ──
  const cleanRows = useMemo(() => rows.filter(r =>
    !r.instructorEdit || (r.instructorEdit !== 'Y' && r.instructorEdit !== 'D')
  ), [rows]);

  const editedRows = useMemo(() => rows.filter(r => r.instructorEdit === 'Y'), [rows]);

  const deletedRows = useMemo(() => rows.filter(r => r.instructorEdit === 'D'), [rows]);

  const taRows = useMemo(() => cleanRows.filter(r =>
    r.position === 'TA' || r.position?.startsWith('TA (GSA)')
  ), [cleanRows]);

  const graderRows = useMemo(() => cleanRows.filter(r => r.position === 'Grader'), [cleanRows]);

  const iaRows = useMemo(() => cleanRows.filter(r => r.position === 'IA'), [cleanRows]);

  // ── Badge: track which edited/deleted row IDs the user has seen ──
  const [seenEditedIds, setSeenEditedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('seenEditedIds') || '[]'); } catch { return []; }
  });
  const [seenDeletedIds, setSeenDeletedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('seenDeletedIds') || '[]'); } catch { return []; }
  });

  const newEditedCount = useMemo(() => {
    const seenSet = new Set(seenEditedIds);
    return editedRows.filter(r => !seenSet.has(r.id)).length;
  }, [editedRows, seenEditedIds]);

  const newDeletedCount = useMemo(() => {
    const seenSet = new Set(seenDeletedIds);
    return deletedRows.filter(r => !seenSet.has(r.id)).length;
  }, [deletedRows, seenDeletedIds]);

  const handleTabChange = (e, newVal) => {
    setActiveTab(newVal);
    if (newVal === 1) {
      const ids = editedRows.map(r => r.id);
      localStorage.setItem('seenEditedIds', JSON.stringify(ids));
      setSeenEditedIds(ids);
    } else if (newVal === 2) {
      const ids = deletedRows.map(r => r.id);
      localStorage.setItem('seenDeletedIds', JSON.stringify(ids));
      setSeenDeletedIds(ids);
    }
  };

  // Handle cell/row updates for editable columns (Position Num + Notes)
  const handleRowUpdate = async (newRow) => {
    try {
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/${newRow.id}`, {
        method: 'PUT',
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

  // Load data from API
  useEffect(() => {
    setLoading(true);
    const termParam = selectedTerm && selectedTerm !== 'current' ? `?term=${selectedTerm}` : '';
    fetch(`${baseUrl}/api/StudentClassAssignment${termParam}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        const mapped = data.map(r => ({
          id: r.Id,
          studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`.trim(),
          firstName: r.First_Name ?? '',
          lastName: r.Last_Name ?? '',
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
          term: r.Term,
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
          instructorEdit: r.Instructor_Edit || null,
          market: r.Market || '',
          residency: r.Residency || '',
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
  }, [selectedTerm]);

  // Striped rows function (with deleted/edited row styling)
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Master Dashboard
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Term</InputLabel>
            <Select
              value={selectedTerm}
              label="Term"
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              {TERM_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              minWidth: 120,
              border: '1px solid #ccc',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              mr: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab label={`Master Dash (${cleanRows.length})`} />
          <Tab label={
            <Badge badgeContent={newEditedCount} color="warning" max={99}>
              {`Edited (${editedRows.length})`}
            </Badge>
          } />
          <Tab label={
            <Badge badgeContent={newDeletedCount} color="error" max={99}>
              {`Deleted (${deletedRows.length})`}
            </Badge>
          } />
          <Tab label={`TAs (${taRows.length})`} />
          <Tab label={`Graders (${graderRows.length})`} />
          <Tab label={`IAs (${iaRows.length})`} />
        </Tabs>

        {/* ═══ TAB 1: Full Master Dashboard ═══ */}
        {activeTab === 0 && (
          <>
            {/* Helper text */}
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Tip: Click the <b>Columns</b> button in the toolbar to show/hide fields or drag to reorder.
            </Typography>

            <Box sx={{ height: 'calc(100vh - 150px)', flexGrow: 1 }}>
              <DataGridPremium
                sx={dataGridSx}
                pagination
                rows={cleanRows}
                columns={tab1Columns}
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
                      instructorEdit: false,
                      market: false,
                      residency: false,
                    },
                  },
                  // Pivot starting layout — opt-in via the Pivot button in the toolbar.
                  pivoting: {
                    active: false,
                    panelOpen: false,
                    model: {
                      rows: [{ field: 'instructorName' }],
                      columns: [{ field: 'position' }],
                      values: [{ field: 'studentName', aggFunc: 'size' }],
                    },
                  },
                }}
                pageSizeOptions={[25, 50, 100, { value: cleanRows.length, label: 'All' }]}
                disableSelectionOnClick
                allowColumnReordering
                slots={{ toolbar: CustomToolbarWithPivot }}
                showToolbar
                headerFilters
                processRowUpdate={handleRowUpdate}
              />
            </Box>
          </>
        )}

        {/* ═══ TAB 2: Edited ═══ */}
        {activeTab === 1 && (
          <Box sx={{ height: 'calc(100vh - 200px)', flexGrow: 1 }}>
            <DataGridPro
              sx={dataGridSx}
              pagination
              rows={editedRows}
              columns={tab1Columns}
              getRowClassName={() => 'edited-row'}
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
                    market: false,
                    residency: false,
                  },
                },
              }}
              pageSizeOptions={[25, 50, 100, { value: editedRows.length, label: 'All' }]}
              disableSelectionOnClick
              allowColumnReordering
              slots={{ toolbar: CustomToolbar }}
              showToolbar
              headerFilters
              processRowUpdate={handleRowUpdate}
            />
          </Box>
        )}

        {/* ═══ TAB 3: Deleted ═══ */}
        {activeTab === 2 && (
          <Box sx={{ height: 'calc(100vh - 200px)', flexGrow: 1 }}>
            <DataGridPro
              sx={dataGridSx}
              pagination
              rows={deletedRows}
              columns={tab1Columns}
              getRowClassName={() => 'deleted-row'}
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
                    market: false,
                    residency: false,
                  },
                },
              }}
              pageSizeOptions={[25, 50, 100, { value: deletedRows.length, label: 'All' }]}
              disableSelectionOnClick
              allowColumnReordering
              slots={{ toolbar: CustomToolbar }}
              showToolbar
              headerFilters
              processRowUpdate={handleRowUpdate}
            />
          </Box>
        )}

        {/* ═══ TAB 4: TAs ═══ */}
        {activeTab === 3 && (
          <Box sx={{ height: 'calc(100vh - 200px)', flexGrow: 1 }}>
            <DataGridPro
              sx={dataGridSx}
              pagination
              rows={taRows}
              columns={slimColumns}
              getRowClassName={getRowClassName}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 50, page: 0 } },
                density: 'compact',
              }}
              pageSizeOptions={[25, 50, 100, { value: taRows.length, label: 'All' }]}
              disableSelectionOnClick
              allowColumnReordering
              slots={{ toolbar: CustomToolbar }}
              showToolbar
              headerFilters
              processRowUpdate={handleRowUpdate}
            />
          </Box>
        )}

        {/* ═══ TAB 5: Graders ═══ */}
        {activeTab === 4 && (
          <Box sx={{ height: 'calc(100vh - 200px)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={batchDownloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                disabled={batchDownloading || graderSelection.ids.size === 0}
                onClick={() => handleBatchDownload(Array.from(graderSelection.ids))}
              >
                Download Selected ({graderSelection.ids.size})
              </Button>
              {batchDownloading && (
                <Typography variant="body2" color="text.secondary">
                  Generating PDFs… this may take a minute.
                </Typography>
              )}
            </Box>
            <DataGridPro
              sx={dataGridSx}
              pagination
              rows={graderRows}
              columns={graderIaColumns}
              getRowClassName={getRowClassName}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 50, page: 0 } },
                density: 'compact',
              }}
              pageSizeOptions={[25, 50, 100, { value: graderRows.length, label: 'All' }]}
              checkboxSelection
              rowSelectionModel={graderSelection}
              onRowSelectionModelChange={setGraderSelection}
              disableRowSelectionOnClick
              allowColumnReordering
              slots={{ toolbar: CustomToolbar }}
              showToolbar
              headerFilters
              processRowUpdate={handleRowUpdate}
            />
          </Box>
        )}

        {/* ═══ TAB 6: IAs ═══ */}
        {activeTab === 5 && (
          <Box sx={{ height: 'calc(100vh - 200px)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={batchDownloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                disabled={batchDownloading || iaSelection.ids.size === 0}
                onClick={() => handleBatchDownload(Array.from(iaSelection.ids))}
              >
                Download Selected ({iaSelection.ids.size})
              </Button>
              {batchDownloading && (
                <Typography variant="body2" color="text.secondary">
                  Generating PDFs… this may take a minute.
                </Typography>
              )}
            </Box>
            <DataGridPro
              sx={dataGridSx}
              pagination
              rows={iaRows}
              columns={graderIaColumns}
              getRowClassName={getRowClassName}
              loading={loading}
              initialState={{
                pagination: { paginationModel: { pageSize: 50, page: 0 } },
                density: 'compact',
              }}
              pageSizeOptions={[25, 50, 100, { value: iaRows.length, label: 'All' }]}
              checkboxSelection
              rowSelectionModel={iaSelection}
              onRowSelectionModelChange={setIaSelection}
              disableRowSelectionOnClick
              allowColumnReordering
              slots={{ toolbar: CustomToolbar }}
              showToolbar
              headerFilters
              processRowUpdate={handleRowUpdate}
            />
          </Box>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Offer Letter Preview Modal */}
      <Dialog
        open={offerLetterModal.open}
        onClose={handleCloseOfferLetter}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          Offer Letter Preview
          {offerLetterModal.row && (
            <Typography variant="body2" color="text.secondary">
              {offerLetterModal.row.firstName} {offerLetterModal.row.lastName} — {offerLetterModal.row.position}, Session {offerLetterModal.row.classSession}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {offerLetterModal.loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 2 }}>
              <CircularProgress />
              <Typography>Generating preview…</Typography>
            </Box>
          )}
          {!offerLetterModal.loading && offerLetterModal.pdfUrl && (
            <iframe
              title="Offer Letter Preview"
              src={offerLetterModal.pdfUrl}
              style={{ width: '100%', height: '100%', border: 'none', flexGrow: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOfferLetter}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadOfferLetter}
            disabled={!offerLetterModal.pdfUrl}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
