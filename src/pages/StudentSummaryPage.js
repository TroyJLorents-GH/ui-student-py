import React, { useState, useRef, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Paper, Stack, Divider, Snackbar, Alert, Select, MenuItem, Card, CardContent, Chip, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress
} from "@mui/material";
import {
  DataGridPro,
  GridRowModes,
  GridActionsCellItem,
  GridRowEditStopReasons,
  useGridApiRef
} from "@mui/x-data-grid-pro";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

const ACTIVE_TERM = '2261';
const HOUR_CAP = String(ACTIVE_TERM).endsWith('4') ? 40 : 20;

// Helper function to get color based on remaining hours (cap-aware)
const getSessionColor = (remaining, cap = HOUR_CAP) => {
  if (remaining === 0) return { main: '#d32f2f', light: '#ffebee', text: '#c62828' }; // Red
  if (remaining <= cap / 2) return { main: '#f57c00', light: '#fff3e0', text: '#e65100' }; // Orange
  return { main: '#2e7d32', light: '#e8f5e9', text: '#1b5e20' }; // Green
};

// Calculate progress percentage (hours used out of cap)
const getProgressValue = (remaining, cap = HOUR_CAP) => ((cap - remaining) / cap) * 100;


// ---- DATA GRID COLUMNS (use camelCase for field names!) ----
const columns = [
  { field: "id", headerName: "ID", width: 70, cellClassName: "locked-cell" }, // Real DB assignment Id
  { 
    field: "position", 
    headerName: "Position", 
    width: 120, 
    editable: true,
    type: "singleSelect",
    valueOptions: ["IA", "Grader", "TA", 'TA (GSA) 1 credit', "TA (GSA) 1 credit +"],
    renderEditCell: (params) => (
      <Select
        value={params.value}
        onChange={e => params.api.setEditCellValue({
          id: params.id,
          field: params.field,
          value: e.target.value
        })}
        variant="standard"
        fullWidth
        // Don't add open={false}
      >
        {params.colDef.valueOptions.map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    )
  },
  { field: "weeklyHours", 
    headerName: "Hours", 
    width: 85, 
    editable: true,
    renderEditCell: (params) => (
      <Select
        value={params.value}
        onChange={e => params.api.setEditCellValue({
          id: params.id,
          field: params.field,
          value: e.target.value
        })}
        variant="standard"
        fullWidth
        // Don't add open={false}
      >
        {[5, 10, 15, 20].map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    ),
   },
  { field: "classSession", headerName: "Session", width: 95, disabled: true, cellClassName: "locked-cell", headerAlign: 'center' },
  { field: "subject", headerName: "Subject", width: 90, disabled: true, cellClassName: "locked-cell", headerAlign: 'center' },
  { field: "catalogNum", headerName: "Catalog #", width: 100, disabled: true, cellClassName: "locked-cell", headerAlign: 'center' },
  { field: "classNum", headerName: "Class #", width: 90, editable: true, headerAlign: 'center' },
  { field: "acadCareer", headerName: "Acad Career", width: 120, disabled: true, cellClassName: "locked-cell", headerAlign: 'center' },
  { field: "instructorName", headerName: "Instructor", width: 180, disabled: true, cellClassName: "locked-cell", headerAlign: 'center' },
  {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 100,
    cellClassName: "actions",
    getActions: (
      { id },
      rowModesModel,
      handleEditClick,
      handleDeleteClick,
      handleSaveClick,
      handleCancelClick
    ) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
      if (isInEditMode) {
        return [
          <GridActionsCellItem icon={<SaveIcon />} label="Save" onClick={handleSaveClick(id)} />,
          <GridActionsCellItem icon={<CancelIcon />} label="Cancel" onClick={handleCancelClick(id)} color="inherit" />
        ];
      }
      return [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={handleEditClick(id)} color="inherit" />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="inherit" />
      ];
    }
  }
];

// ---- Detail panel component
function AssignmentDetailPanel({ row }) {
  return (
    <Box sx={{ p: 2, minHeight: 120 }}>
      <Typography variant="h6" gutterBottom>
        Assignment Detail
      </Typography>
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} gap={6} flexWrap="wrap" mb={2}>
        <Box>
          <Typography variant="body2"><b>Position:</b> {row.position}</Typography>
          <Typography variant="body2"><b>Weekly Hours:</b> {row.weeklyHours}</Typography>
        </Box>
        <Box>
          <Typography variant="body2"><b>Class #:</b> {row.classNum}</Typography>
          <Typography variant="body2"><b>Session:</b> {row.classSession}</Typography>
        </Box>
        <Box>
          <Typography variant="body2"><b>Subject:</b> {row.subject}</Typography>
          <Typography variant="body2"><b>Catalog #:</b> {row.catalogNum}</Typography>
          
        </Box>
        <Box>
          <Typography variant="body2"><b>Instructor:</b> {row.instructorName}</Typography>
          <Typography variant="body2"><b>Acad Career:</b> {row.acadCareer}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" color="text.secondary">
        Assignment created by SCAI bulk/portal process.
      </Typography>
    </Box>
  );
}

export default function StudentSummaryPage() {
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [edited, setEdited] = useState(false);
  const pendingDeletes = useRef([]); // IDs to delete
  const originalRowsRef = useRef([]); // for tracking original state

  // Hours validation dialog state
  const [hoursDialog, setHoursDialog] = useState({ open: false, studentName: '', requestedHours: 0, targetSession: '', sessionData: null });

  // Detail panel expanded rows - auto-expand when editing (must be a Set for DataGridPro)
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState(new Set());
  const apiRef = useGridApiRef();

  // --- Pull assignments from summary into editable state ---
  useEffect(() => {
    if (summary?.assignments) {
      const mappedRows = summary.assignments.map((a) => ({
        id: a.AssignmentId || a.Id,
        position: a.Position,
        weeklyHours: a.WeeklyHours,
        classSession: a.ClassSession,
        subject: a.Subject,
        catalogNum: a.CatalogNum,
        classNum: a.ClassNum,
        acadCareer: a.AcadCareer,
        instructorName: a.InstructorName,
      }));
      setRows(mappedRows);
      originalRowsRef.current = mappedRows;
      setRowModesModel({});
      pendingDeletes.current = [];
      setEdited(false);
    }
  }, [summary]);

  // --- Search/lookup ---
  const handleLookup = async () => {
    setError("");
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch(`/api/StudentClassAssignment/student-summary/${search}`);
      if (!res.ok) throw new Error("Student not found");
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Action handlers ---
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = id => () => {
    setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
    // Auto-expand the detail panel when editing
    setDetailPanelExpandedRowIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleSaveClick = id => () => {
    setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.View } }));
    setEdited(true);
  };

  const handleDeleteClick = id => () => {
    setRows(prevRows => prevRows.filter(row => row.id !== id));
    pendingDeletes.current.push(id);
    setEdited(true);
  };

  const handleCancelClick = id => () => {
    setRowModesModel(prev => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    }));
  };

  // --- Handle row changes locally ---
  const processRowUpdate = async (newRow, oldRow) => {
    let updatedRow = { ...oldRow, ...newRow };

    // If class number changed, fetch new class info first
    if (newRow.classNum !== oldRow.classNum) {
      try {
        const term = "2264";
        const res = await fetch(`/api/class/details/${newRow.classNum}?term=${term}`);
        if (!res.ok) throw new Error("Class not found");
        const classInfo = await res.json();
        updatedRow.subject = classInfo.Subject;
        updatedRow.catalogNum = classInfo.CatalogNum;
        updatedRow.acadCareer = classInfo.AcadCareer;
        updatedRow.classSession = classInfo.Session;
        updatedRow.instructorName = `${classInfo.InstructorFirstName} ${classInfo.InstructorLastName}`;
      } catch (e) {
        setSnackbar({ open: true, message: `Class lookup failed: ${e.message}`, severity: "error" });
        return oldRow; // Reject the update
      }
    }

    // Validate hours against session limits
    if (summary && (newRow.weeklyHours !== oldRow.weeklyHours || newRow.classNum !== oldRow.classNum)) {
      const newHours = parseInt(updatedRow.weeklyHours, 10);
      const oldHours = parseInt(oldRow.weeklyHours, 10) || 0;
      const targetSession = (updatedRow.classSession || '').toUpperCase().trim();
      const oldSession = (oldRow.classSession || '').toUpperCase().trim();

      // Calculate current session totals from summary
      const hoursA = summary.sessionA || 0;
      const hoursB = summary.sessionB || 0;
      const hoursC = summary.sessionC || 0;

      // Calculate remaining hours per session (DYN counts as C)
      let remainingA = Math.max(0, HOUR_CAP - hoursA - hoursC);
      let remainingB = Math.max(0, HOUR_CAP - hoursB - hoursC);

      // Add back the original hours if editing same session
      if (oldSession === 'A') remainingA += oldHours;
      if (oldSession === 'B') remainingB += oldHours;
      if (oldSession === 'C' || oldSession === 'DYN') {
        remainingA += oldHours;
        remainingB += oldHours;
      }

      // Get remaining for target session
      let remainingForTarget;
      if (targetSession === 'A') remainingForTarget = remainingA;
      else if (targetSession === 'B') remainingForTarget = remainingB;
      else if (targetSession === 'C' || targetSession === 'DYN') remainingForTarget = Math.min(remainingA, remainingB);
      else remainingForTarget = HOUR_CAP;

      // Check if new hours exceed limit
      if (newHours > remainingForTarget) {
        setHoursDialog({
          open: true,
          studentName: summary.StudentName || 'This student',
          requestedHours: newHours,
          targetSession: targetSession,
          sessionData: {
            remainingA: Math.max(0, HOUR_CAP - hoursA - hoursC + (oldSession === 'A' || oldSession === 'C' || oldSession === 'DYN' ? oldHours : 0)),
            remainingB: Math.max(0, HOUR_CAP - hoursB - hoursC + (oldSession === 'B' || oldSession === 'C' || oldSession === 'DYN' ? oldHours : 0)),
            remainingC: Math.max(0, Math.min(
              HOUR_CAP - hoursA - hoursC + (oldSession === 'A' || oldSession === 'C' || oldSession === 'DYN' ? oldHours : 0),
              HOUR_CAP - hoursB - hoursC + (oldSession === 'B' || oldSession === 'C' || oldSession === 'DYN' ? oldHours : 0)
            )),
            cap: HOUR_CAP
          }
        });
        return oldRow; // Reject the update
      }
    }

    updatedRow._edited = true;
    setRows(prevRows => prevRows.map(row => (row.id === updatedRow.id ? updatedRow : row)));
    setEdited(true);
    return updatedRow;
  };

  // --- Save (persist) changes to backend ---
  const handleSaveAll = async () => {
    try {
      // 1. Find edited rows: changed position/hours/classnum (ignore unedited)
      const editedRows = rows.filter(row => row._edited).map(row => ({
        id: row.id,
        Position: row.position,
        WeeklyHours: row.weeklyHours,
        ClassNum: row.classNum
      }));

      const deletes = [...pendingDeletes.current];

      const response = await fetch(`/api/StudentClassAssignment/bulk-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: editedRows,
          deletes,
          studentId: summary.Student_ID || summary.ASUrite
        })
      });

      if (!response.ok) throw new Error("Failed to save changes");
      const data = await response.json();

      // Map backend fields to frontend DataGrid fields
      const backendToFrontendField = {
        WeeklyHours: "weeklyHours",
        Position: "position",
        ClassNum: "classNum"
      };

      if (data.updated) {
        localStorage.setItem(
          'recentlyEditedAssignments',
          JSON.stringify(data.updated.map(r => ({
            id: r.Id,
            changed_fields: r.changed_fields.map(f => backendToFrontendField[f] || f)
          })))
        );
      }

      setSnackbar({ open: true, message: 'Changes saved successfully!', severity: 'success' });
      setEdited(false);
      handleLookup();
    } catch (e) {
      setSnackbar({ open: true, message: e.message, severity: 'error' });
    }
  };

  // --- Discard local changes ---
  const handleDiscard = () => {
    setRows([...originalRowsRef.current]);
    setRowModesModel({});
    pendingDeletes.current = [];
    setEdited(false);
    setSnackbar({ open: true, message: 'Changes discarded', severity: 'info' });
  };

  // --- Available weekly hours calculation (session-based) ---
  const renderAvailableHours = (summary) => {
    const hoursA = summary.sessionA || 0;
    const hoursB = summary.sessionB || 0;
    const hoursC = summary.sessionC || 0;

    // Calculate remaining hours per session (C counts against both A and B)
    const remainingA = Math.max(0, HOUR_CAP - hoursA - hoursC);
    const remainingB = Math.max(0, HOUR_CAP - hoursB - hoursC);
    const remainingC = Math.max(0, Math.min(remainingA, remainingB));

    const sessions = [
      { label: 'Session A', remaining: remainingA, subtitle: 'First Half' },
      { label: 'Session B', remaining: remainingB, subtitle: 'Second Half' },
      { label: 'Session C', remaining: remainingC, subtitle: 'Full Semester' },
    ];

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Remaining Hours Available
        </Typography>
        <Stack direction="row" spacing={2}>
          {sessions.map((session) => {
            const colors = getSessionColor(session.remaining);
            return (
              <Card
                key={session.label}
                sx={{
                  minWidth: 120,
                  backgroundColor: colors.light,
                  border: `2px solid ${colors.main}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#000', fontWeight: 600 }}>
                    {session.label}
                  </Typography>
                  <Typography variant="h5" sx={{ color: colors.text, fontWeight: 'bold', my: 0.5 }}>
                    {session.remaining}h
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(session.remaining)}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colors.main,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.7rem', fontWeight: 500 }}>
                    {session.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>
    );
  };

  return (
    <Box maxWidth={1300} mx="auto" mt={4}>
      {/* Search Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Student Assignment Summary
        </Typography>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="ASUrite or Student ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            onKeyDown={e => e.key === "Enter" && handleLookup()}
          />
          <Button variant="contained" onClick={handleLookup} disabled={!search || loading} sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' },
            }}>
            LOOKUP
          </Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </Paper>

      {loading && <Typography>Loading...</Typography>}

      {/* Student Info Card */}
      {summary && (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#8c1d40', mb: 1 }}>
                {summary.StudentName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label={summary.ASUrite} color="primary" variant="outlined" />
                <Chip label={`ID: ${summary.Student_ID}`} color="default" variant="outlined" />
                <Chip label={summary.EducationLevel} sx={{ backgroundColor: '#FFC627', fontWeight: 600 }} />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8c1d40' }}>
                Session Hours Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Session A
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#8c1d40', fontWeight: 700 }}>
                      {summary.sessionA}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      hours
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Session B
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#8c1d40', fontWeight: 700 }}>
                      {summary.sessionB}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      hours
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Session C
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#8c1d40', fontWeight: 700 }}>
                      {summary.sessionC}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      hours
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              {/* Show available hours */}
              {renderAvailableHours(summary)}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Assignment DataGridPro with detail panel and editing */}
      {summary && (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGridPro
            apiRef={apiRef}
            pagination
            rows={rows}
            columns={columns.map(col =>
              col.field === "actions"
                ? {
                  ...col,
                  getActions: params => columns[columns.length - 1].getActions(
                    params,
                    rowModesModel,
                    handleEditClick,
                    handleDeleteClick,
                    handleSaveClick,
                    handleCancelClick
                  )
                }
                : col
            )}
            editMode="cell"
            rowModesModel={rowModesModel}
            onRowModesModelChange={setRowModesModel}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            getDetailPanelContent={({ row }) => <AssignmentDetailPanel row={row} />}
            getDetailPanelHeight={() => "auto"}
            detailPanelExpandedRowIds={detailPanelExpandedRowIds}
            onDetailPanelExpandedRowIdsChange={(newIds) => setDetailPanelExpandedRowIds(new Set(newIds))}
            showCellVerticalBorder
            showColumnVerticalBorder
            sx={{
              "& .MuiDataGrid-detailPanel": { bgcolor: "#e3f2fd" },
              "& .locked-cell": {
                backgroundColor: "#ececec",
                color: "#888",
                fontStyle: "italic",
                fontSize: "0.97em",
                position: "relative",
                border: "1px solid #ddd",
              },
              "& .locked-cell::after": {
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1em",
                opacity: 0.44,
                pointerEvents: "none"
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
              '& .MuiDataGrid-cell': { textAlign: 'center' },
            }}
            disableSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
            columnHeaderHeight={56}
          />
          {/* Save/discard buttons */}
          <Box mt={2} display="flex" gap={2} sx={{ marginBottom: '8px', bottom: '10px', paddingBottom: '8px' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#8c1d40',
                '&:hover': { backgroundColor: '#701831' },
              }}
              onClick={handleSaveAll}
              disabled={!edited}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDiscard}
              disabled={!edited}
            >
              Discard Changes
            </Button>
          </Box>
        </Box>
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Hours Validation Dialog */}
      <Dialog
        open={hoursDialog.open}
        onClose={() => setHoursDialog({ ...hoursDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#ffebee', color: '#c62828' }}>
          Cannot Add {hoursDialog.requestedHours} Hours
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            <strong>{hoursDialog.studentName}</strong> doesn't have enough hours available for <strong>Session {hoursDialog.targetSession}</strong>.
          </Typography>

          {hoursDialog.sessionData && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Current Availability
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                {[
                  { label: 'Session A', remaining: hoursDialog.sessionData.remainingA, subtitle: 'First Half' },
                  { label: 'Session B', remaining: hoursDialog.sessionData.remainingB, subtitle: 'Second Half' },
                  { label: 'Session C', remaining: hoursDialog.sessionData.remainingC, subtitle: 'Full Semester' },
                ].map((session) => {
                  const colors = getSessionColor(session.remaining);
                  const isTarget = session.label.slice(-1) === hoursDialog.targetSession;
                  return (
                    <Card
                      key={session.label}
                      sx={{
                        minWidth: 120,
                        backgroundColor: colors.light,
                        border: `2px solid ${colors.main}`,
                        borderRadius: 2,
                        boxShadow: isTarget ? `0 0 8px ${colors.main}` : 'none',
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="caption" sx={{ color: '#000', fontWeight: 600 }}>
                          {session.label} {isTarget && '(Target)'}
                        </Typography>
                        <Typography variant="h5" sx={{ color: colors.text, fontWeight: 'bold', my: 0.5 }}>
                          {session.remaining}h
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressValue(session.remaining)}
                          sx={{
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: colors.main,
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.7rem', fontWeight: 500 }}>
                          {session.subtitle}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setHoursDialog({ ...hoursDialog, open: false })}
            variant="contained"
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
