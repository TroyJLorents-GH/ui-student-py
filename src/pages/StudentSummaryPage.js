import React, { useState, useRef, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Paper, Stack, Divider, Snackbar, Alert, Select, MenuItem
} from "@mui/material";
import {
  DataGridPro,
  GridRowModes,
  GridActionsCellItem,
  GridRowEditStopReasons
} from "@mui/x-data-grid-pro";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

// ---- DATA GRID COLUMNS (use camelCase for field names!) ----
const columns = [
  { field: "id", headerName: "ID", width: 70, cellClassName: "locked-cell" }, // Real DB assignment Id
  {
    field: "position",
    headerName: "Position",
    width: 120,
    editable: true,
    type: "singleSelect",
    valueOptions: ['IA', 'Grader', 'TA', 'TA (GSA) 1 credit'],
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
  {
    field: "weeklyHours",
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
  { field: "classSession", headerName: "Session", width: 95, disabled: true, cellClassName: "locked-cell" },
  { field: "subject", headerName: "Subject", width: 90, disabled: true, cellClassName: "locked-cell" },
  { field: "catalogNum", headerName: "Catalog #", width: 100, disabled: true, cellClassName: "locked-cell" },
  { field: "classNum", headerName: "Class #", width: 90, editable: true },
  { field: "acadCareer", headerName: "Acad Career", width: 120, disabled: true, cellClassName: "locked-cell" },
  { field: "instructorName", headerName: "Instructor", width: 180, disabled: true, cellClassName: "locked-cell" },
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
    if (newRow.classNum !== oldRow.classNum) {
      try {
        const term = "2254";
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

  // --- Available weekly hours calculation ---
  const renderAvailableHours = (summary) => {
    const maxWeeklyHours = 20;
    const sessionA = summary.sessionA || 0;
    const sessionB = summary.sessionB || 0;
    const sessionC = summary.sessionC || 0;
    const totalAssignedHours = sessionA + sessionB + sessionC;
    const hoursLeft = Math.max(maxWeeklyHours - totalAssignedHours, 0);

    return (
      <Typography variant="subtitle2" color={hoursLeft <= 0 ? "error" : "primary"} sx={{ mt: 2 }}>
        {summary.StudentName} has {hoursLeft} weekly hour{hoursLeft === 1 ? "" : "s"} available to be hired.
      </Typography>
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
          <Button variant="contained" onClick={handleLookup} disabled={!search || loading}>
            LOOKUP
          </Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </Paper>

      {loading && <Typography>Loading...</Typography>}

      {/* Student Info Card */}
      {summary && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#f1f5f9" }}>
          <Typography variant="h6" gutterBottom>
            {summary.StudentName} ({summary.ASUrite})
          </Typography>
          <Typography variant="subtitle1">
            Education: {summary.EducationLevel}
          </Typography>
          <Box mt={2}>
            <Typography variant="body1" fontWeight="bold">Session Hours:</Typography>
            <Box display="flex" gap={3} mt={1}>
              <div>Session A: <b>{summary.sessionA}</b> hrs</div>
              <div>Session B: <b>{summary.sessionB}</b> hrs</div>
              <div>Session C: <b>{summary.sessionC}</b> hrs</div>
            </Box>
            {/* Show available hours */}
            {renderAvailableHours(summary)}
          </Box>
        </Paper>
      )}

      {/* Assignment DataGridPro with detail panel and editing */}
      {summary && (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGridPro
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
                // Optional: "filled" border
                border: "1px solid #ddd",
              },
              "& .locked-cell::after": {
                //content: '"🔒"',
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1em",
                opacity: 0.44,
                pointerEvents: "none"
              }
            }}
            disableSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
          />
          {/* Save/discard buttons */}
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAll}
              disabled={!edited}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
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
    </Box>
  );
}