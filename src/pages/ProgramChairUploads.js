import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Paper, Typography, Button, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, LinearProgress, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon, Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import { computeCostCenterKey } from '../utils/costCenterRules';
import { CustomToolbar, getDataGridSx } from '../utils/dataGridStyles';

const baseUrl = process.env.REACT_APP_API_URL;
const CURRENT_TERM = '2264'; // Default term

const POSITIONS = ['TA', 'IA', 'Grader', 'TA (GSA) 1 credit', 'TA (GSA) 1 credit +'];
const HOURS = [5, 10, 15, 20];
const HOURS_SUMMER = [5, 10, 15, 20, 25, 30, 35, 40];
const FULTON_FELLOW_OPTIONS = ['Yes', 'No'];

// Helper function to get color based on remaining hours (cap-aware)
const getSessionColor = (remaining, cap = 20) => {
  if (remaining === 0) return { main: '#d32f2f', light: '#ffebee', text: '#c62828' }; // Red
  if (remaining <= cap / 2) return { main: '#f57c00', light: '#fff3e0', text: '#e65100' }; // Orange
  return { main: '#2e7d32', light: '#e8f5e9', text: '#1b5e20' }; // Green
};

// Calculate progress percentage (hours used out of cap)
const getProgressValue = (remaining, cap = 20) => ((cap - remaining) / cap) * 100;

// Calculate compensation based on position, hours, degree, fellow status, and session
const calculateComp = (pos, hours, edu, fellow, session, term) => {
  const h = parseInt(hours, 10);
  const sess = String(session || "").toUpperCase();
  const degree = String(edu || "").toUpperCase();
  const ff = fellow || "No";

  // --- Summer terms (ending in 4) ---
  if (term && String(term).endsWith("4")) {
    const sessionMultiplier = { A: 2.5, B: 4, C: 5, DYN: 5 }[sess] || 0;
    if (pos === "Grader") return Math.round(15.62 * (h * 2) * sessionMultiplier * 100) / 100;
    if (pos === "IA") return Math.round(22.00 * (h * 2) * sessionMultiplier * 100) / 100;
    return 0;
  }

  // --- Spring/Fall ---

  // --- Grader (MS or PHD, Fellow: No) ---
  if (pos === "Grader" && (degree === "BS" ||degree === "MS" || degree === "PHD") && ff === "No") {
    if (h === 5)  { if (sess === "C") return 1562; if (sess === "A" || sess === "B") return 781; }
    if (h === 10) { if (sess === "C") return 3124; if (sess === "A" || sess === "B") return 1562; }
    if (h === 15) { if (sess === "C") return 4686; if (sess === "A" || sess === "B") return 2343; }
    if (h === 20) { if (sess === "C") return 6248; if (sess === "A" || sess === "B") return 3124; }
  }

  // --- TA (GSA) 1 credit (PhD, Fellow: No) ---
  if (pos === "TA (GSA) 1 credit" && degree === "PHD" && ff === "No") {
    if (h === 10) return 8093.00;
    if (h === 20) return 17600.00;
  }

  // --- TA (GSA) 1 credit + (PhD, Fellow: No) ---
  if (pos === "TA (GSA) 1 credit +" && degree === "PHD" && ff === "No") {
    if (h === 10) return 8800.00;
  }

  // --- TA ---
  if (pos === "TA") {
    if (h === 20 && degree === "PHD" && ff === "Yes") return 13461.15;
    if (h === 10 && degree === "MS"  && ff === "No")  return 6636.00;
    if (h === 10 && degree === "PHD" && ff === "No")  return 7250.00;
    if (h === 20 && degree === "MS"  && ff === "No")  return 13272.00;
    if (h === 20 && degree === "PHD" && ff === "No")  return 14500.00;
  }

  // --- IA (MS or PHD, Fellow: No) ---
  if (pos === "IA" && (degree === "BS" ||degree === "MS" || degree === "PHD") && ff === "No") {
    if (h === 5)  { if (sess === "C") return 2200; if (sess === "A" || sess === "B") return 1100; }
    if (h === 10) { if (sess === "C") return 4400; if (sess === "A" || sess === "B") return 2200; }
    if (h === 15) { if (sess === "C") return 6600; if (sess === "A" || sess === "B") return 2640; }
    if (h === 20) { if (sess === "C") return 8800; if (sess === "A" || sess === "B") return 4400; }
  }

  return 0;
};

export default function ProgramChairUploads() {
  const theme = useTheme();
  const dataGridSx = useMemo(() => ({
    ...getDataGridSx(theme),
    '& .readonly-cell': {
      backgroundColor: '#f5f5f5',
      color: '#666',
      fontStyle: 'italic',
    },
  }), [theme]);

  const { asurite, perms } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingId, setEditingId] = useState(null);
  const [newRowId, setNewRowId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const apiRef = useRef(null);
  // Track session-based hours for students being edited/added (studentId -> { hoursA, hoursB, hoursC, remainingA, remainingB, remainingC })
  const [studentHoursMap, setStudentHoursMap] = useState({});
  // Store original row data when editing starts (to compare hours changes)
  const [originalEditRow, setOriginalEditRow] = useState(null);
  // Hours validation dialog state
  const [hoursDialog, setHoursDialog] = useState({ open: false, studentName: '', requestedHours: 0, targetSession: '', sessionData: null });
  // Load user's assignments
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/StudentClassAssignment/my-uploads`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        const mapped = data.map(r => ({
          id: r.Id,
          studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`.trim(),
          student_ID: r.Student_ID,
          asurite: r.ASUrite,
          position: r.Position,
          weeklyHours: r.WeeklyHours,
          fultonFellow: r.FultonFellow,
          subject: r.Subject,
          catalogNum: r.CatalogNum,
          classNum: r.ClassNum,
          email: r.Email,
          educationLevel: r.EducationLevel,
          instructorName: `${r.InstructorFirstName} ${r.InstructorLastName}`.trim(),
          classSession: r.ClassSession,
          location: r.Location,
          campus: r.Campus,
          acad_career: r.AcadCareer,
          cost_center: r.CostCenterKey,
          compensation: r.Compensation,
          createdAt: r.CreatedAt,
          term: r.Term,
          instructorId: r.InstructorID,
          cum_gpa: r.cum_gpa,
          cur_gpa: r.cur_gpa,
          notes: r.Notes || '',
          status: r.Status || '',
          isNew: false,
        }));
        setRows(mapped);
        setError('');
      })
      .catch(err => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Striped rows styling
  const getRowClassName = (params) => {
    return params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row';
  };

  // Add new row
  const handleAddRow = () => {
    const newId = `new-${Date.now()}`;
    const newRow = {
      id: newId,
      student_ID: '',
      asurite: '',
      position: '',
      weeklyHours: '',
      fultonFellow: 'No',
      classNum: '',
      studentName: '',
      subject: '',
      catalogNum: '',
      email: '',
      educationLevel: '',
      instructorName: '',
      classSession: '',
      location: '',
      campus: '',
      acad_career: '',
      cost_center: '',
      compensation: 0,
      createdAt: new Date().toISOString(),
      term: '',
      instructorId: null,
      cum_gpa: 0,
      cur_gpa: 0,
      isNew: true,
    };
    setRows(prev => [...prev, newRow]);
    setEditingId(newId);
    setNewRowId(newId);

    // Scroll to the new row so it's visible
    setTimeout(() => {
      if (apiRef.current) {
        apiRef.current.scrollToIndexes({ rowIndex: rows.length });
      }
    }, 100);
  };

  // Handle field changes with auto-population
  const handleRowUpdate = async (newRow) => {
    const oldRow = rows.find(r => r.id === newRow.id);
    let updatedRow = { ...newRow };

    // Auto-fetch student details when Student_ID or ASUrite changes
    if (newRow.isNew && (newRow.student_ID !== oldRow?.student_ID || newRow.asurite !== oldRow?.asurite)) {
      const identifier = newRow.student_ID || newRow.asurite;
      if (identifier) {
        try {
          const res = await fetch(`${baseUrl}/api/StudentLookup/${identifier}`, {
            credentials: 'include'
          });
          if (res.ok) {
            const student = await res.json();
            updatedRow.student_ID = student.Student_ID;
            updatedRow.asurite = student.ASUrite;
            updatedRow.studentName = `${student.First_Name} ${student.Last_Name}`.trim();
            updatedRow.email = student.ASU_Email_Adress;
            updatedRow.educationLevel = student.Degree;
            updatedRow.cum_gpa = parseFloat(student.Cumulative_GPA) || 0;
            updatedRow.cur_gpa = parseFloat(student.Current_GPA) || 0;

            // Fetch session-based hours for this student
            try {
              const hoursRes = await fetch(`${baseUrl}/api/StudentClassAssignment/totalhours/${student.Student_ID}`, {
                credentials: 'include'
              });
              if (hoursRes.ok) {
                const sessionData = await hoursRes.json();
                // sessionData: { hoursA, hoursB, hoursC, remainingA, remainingB, remainingC, total }
                setStudentHoursMap(prev => ({ ...prev, [student.Student_ID]: sessionData }));
              }
            } catch (hoursErr) {
              console.error('Failed to fetch student hours:', hoursErr);
            }
          }
        } catch (err) {
          console.error('Failed to fetch student:', err);
        }
      }
    }

    // Auto-fetch class details when ClassNum changes
    if (newRow.isNew && newRow.classNum !== oldRow?.classNum && newRow.classNum) {
      try {
        const res = await fetch(
          `${baseUrl}/api/class/details/${newRow.classNum}?term=${CURRENT_TERM}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const classData = await res.json();
          updatedRow.subject = classData.Subject;
          updatedRow.catalogNum = classData.CatalogNum;
          updatedRow.classSession = classData.Session;
          updatedRow.location = classData.Location;
          updatedRow.campus = classData.Campus;
          updatedRow.acad_career = classData.AcadCareer;
          updatedRow.instructorName = `${classData.InstructorFirstName} ${classData.InstructorLastName}`.trim();
          updatedRow.instructorId = classData.InstructorID;
          updatedRow.term = classData.Term;
          updatedRow.cost_center = classData.CostCenterKey || '';
        } else {
          setSnackbar({
            open: true,
            message: `Class number ${newRow.classNum} not found for term ${CURRENT_TERM}`,
            severity: 'error'
          });
        }
      } catch (err) {
        console.error('Failed to fetch class:', err);
      }
    }

    setRows(prev =>
      prev.map(row => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  // Save new row
  const handleSaveNewRow = async (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    if (!asurite) {
      setSnackbar({
        open: true,
        message: 'User not authenticated',
        severity: 'error'
      });
      return;
    }

    if (!row.student_ID || !row.position || !row.classNum || !row.weeklyHours) {
      setSnackbar({
        open: true,
        message: 'Please fill in Student ID, Position, Weekly Hours, and Class Number',
        severity: 'error'
      });
      return;
    }

    // Check if adding these hours would exceed the session hour cap (40 summer / 20 else)
    const sessionData = studentHoursMap[row.student_ID];
    const newHours = parseInt(row.weeklyHours, 10);
    const classSession = (row.classSession || '').toUpperCase().trim();
    const sessionCap = sessionData?.cap || 20;

    if (sessionData && classSession) {
      // Get remaining hours for the specific session (DYN counts as C)
      let remainingForSession;
      if (classSession === 'A') remainingForSession = sessionData.remainingA;
      else if (classSession === 'B') remainingForSession = sessionData.remainingB;
      else if (classSession === 'C' || classSession === 'DYN') remainingForSession = sessionData.remainingC;
      else remainingForSession = sessionCap;

      if (newHours > remainingForSession) {
        setHoursDialog({
          open: true,
          studentName: row.studentName || 'This student',
          requestedHours: newHours,
          targetSession: classSession,
          sessionData: sessionData
        });
        return;
      }
    }

    try {
      // Get student details
      const studentRes = await fetch(`${baseUrl}/api/StudentLookup/${row.student_ID}`, {
        credentials: 'include'
      });
      if (!studentRes.ok) throw new Error('Student not found');
      const student = await studentRes.json();

      // Get class details
      const classRes = await fetch(
        `${baseUrl}/api/class/details/${row.classNum}?term=${CURRENT_TERM}`,
        { credentials: 'include' }
      );
      if (!classRes.ok) throw new Error('Class not found');
      const classData = await classRes.json();

      // Calculate compensation and cost center
      const compensation = calculateComp(row.position, row.weeklyHours, student.Degree, row.fultonFellow, classData.Session, classData.Term);
      const costCenter = computeCostCenterKey(row.position, classData.Location, classData.Campus, classData.AcadCareer, classData.Term);

      // Create assignment
      const payload = {
        Student_ID: student.Student_ID,
        ASUrite: student.ASUrite,
        Position: row.position,
        Email: student.ASU_Email_Adress,
        First_Name: student.First_Name,
        Last_Name: student.Last_Name,
        EducationLevel: student.Degree,
        Subject: classData.Subject,
        CatalogNum: classData.CatalogNum,
        ClassSession: classData.Session,
        ClassNum: row.classNum,
        Term: classData.Term,
        InstructorFirstName: classData.InstructorFirstName && classData.InstructorFirstName.trim() ? classData.InstructorFirstName : 'Staff TBD',
        InstructorLastName: classData.InstructorLastName && classData.InstructorLastName.trim() ? classData.InstructorLastName : 'Staff TBD',
        InstructorID: classData.InstructorID && classData.InstructorID !== '' ? parseInt(classData.InstructorID, 10) : null,
        WeeklyHours: parseInt(row.weeklyHours, 10),
        FultonFellow: row.fultonFellow,
        Location: classData.Location,
        Campus: classData.Campus,
        AcadCareer: classData.AcadCareer,
        CostCenterKey: costCenter || '',
        Compensation: compensation,
        ImportedBy: asurite,
        cum_gpa: parseFloat(student.Cumulative_GPA) || 0,
        cur_gpa: parseFloat(student.Current_GPA) || 0,
      };

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to add assignment');

      // Remove from local state and reload
      setRows(prev => prev.filter(r => r.id !== rowId));
      setEditingId(null);
      setNewRowId(null);
      setSnackbar({ open: true, message: 'Assignment added successfully!', severity: 'success' });

      // Reload data after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Save edits to existing row
  const handleSaveEdit = async (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || row.isNew) return;

    if (!row.asurite) {
      setSnackbar({
        open: true,
        message: 'Student ASUrite not found',
        severity: 'error'
      });
      return;
    }

    // Check if editing hours would exceed the 20-hour limit for the class session
    const newHours = parseInt(row.weeklyHours, 10);
    const originalHours = originalEditRow ? parseInt(originalEditRow.weeklyHours, 10) || 0 : 0;
    const classSession = (row.classSession || '').toUpperCase().trim();
    const originalSession = originalEditRow ? (originalEditRow.classSession || '').toUpperCase().trim() : classSession;

    try {
      const hoursRes = await fetch(`${baseUrl}/api/StudentClassAssignment/totalhours/${row.student_ID}`, {
        credentials: 'include'
      });
      if (hoursRes.ok) {
        const sessionData = await hoursRes.json();
        // sessionData: { hoursA, hoursB, hoursC, remainingA, remainingB, remainingC, cap, total }

        // Get remaining for the target session (DYN counts as C)
        const sessionCap = sessionData?.cap || 20;
        let remainingForSession;
        if (classSession === 'A') remainingForSession = sessionData.remainingA;
        else if (classSession === 'B') remainingForSession = sessionData.remainingB;
        else if (classSession === 'C' || classSession === 'DYN') remainingForSession = sessionData.remainingC;
        else remainingForSession = sessionCap;

        // If editing same session assignment, add back original hours to remaining
        if (classSession === originalSession) {
          remainingForSession += originalHours;
        }

        if (newHours > remainingForSession) {
          setHoursDialog({
            open: true,
            studentName: row.studentName || 'This student',
            requestedHours: newHours,
            targetSession: classSession,
            sessionData: sessionData
          });
          return;
        }
      }
    } catch (hoursErr) {
      console.error('Failed to validate hours:', hoursErr);
      // Continue with save if validation fails - let backend handle it
    }

    try {
      const payload = {
        Position: row.position,
        WeeklyHours: parseInt(row.weeklyHours, 10),
        ClassNum: row.classNum,
        ImportedBy: asurite, // Preserve ImportedBy so row stays in my-uploads filter
      };

      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/bulk-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          updates: [{ id: rowId, ...payload }],
          deletes: [],
          studentId: row.asurite
        })
      });

      if (!response.ok) throw new Error('Save failed');

      const result = await response.json();

      setEditingId(null);
      setOriginalEditRow(null); // Clear original row data

      // Track recently edited rows for highlighting (persists until Reviewed checkbox in MasterDashboard)
      if (result.updated && result.updated.length > 0) {
        const updatedAssignment = result.updated[0];

        // Update the row with fresh data from backend (includes new Subject, CatalogNum, etc. if ClassNum changed)
        setRows(prev =>
          prev.map(r =>
            r.id === rowId
              ? {
                  ...r,
                  position: updatedAssignment.Position,
                  weeklyHours: updatedAssignment.WeeklyHours,
                  classNum: updatedAssignment.ClassNum,
                  subject: updatedAssignment.Subject,
                  catalogNum: updatedAssignment.CatalogNum,
                  classSession: updatedAssignment.ClassSession,
                  location: updatedAssignment.Location,
                  campus: updatedAssignment.Campus,
                  instructorName: `${updatedAssignment.InstructorFirstName} ${updatedAssignment.InstructorLastName}`.trim(),
                  cost_center: updatedAssignment.CostCenterKey,
                  compensation: updatedAssignment.Compensation,
                }
              : r
          )
        );

      }

      setSnackbar({ open: true, message: 'Changes saved!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (newRowId) {
      setRows(prev => prev.filter(r => r.id !== newRowId));
      setNewRowId(null);
    }
    setEditingId(null);
    setOriginalEditRow(null); // Clear original row data
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  // Confirm and delete row
  const handleConfirmDelete = async () => {
    if (!rowToDelete || rowToDelete.isNew) {
      // If new row, just remove from local state
      setRows(prev => prev.filter(r => r.id !== rowToDelete.id));
      setDeleteDialogOpen(false);
      setRowToDelete(null);
      setSnackbar({ open: true, message: 'Row removed', severity: 'success' });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/StudentClassAssignment/bulk-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          updates: [],
          deletes: [rowToDelete.id],
          studentId: rowToDelete.asurite
        })
      });

      if (!response.ok) throw new Error('Delete failed');

      // Remove from local state
      setRows(prev => prev.filter(r => r.id !== rowToDelete.id));
      setDeleteDialogOpen(false);
      setRowToDelete(null);
      setSnackbar({ open: true, message: 'Assignment marked for deletion', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Mark non-editable fields
  const getCellClassName = (params) => {
    if ((params.field === 'student_ID' || params.field === 'asurite') && !params.row.isNew) {
      return 'readonly-cell';
    }
    return '';
  };

  // Columns
  const columns = [
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', width: 150, cellClassName: 'readonly-cell' },
    {
      field: 'student_ID',
      headerName: 'Student ID',
      headerAlign: 'center',
      width: 120,
      editable: (params) => params.row.isNew // Only editable when adding new
    },
    {
      field: 'asurite',
      headerName: 'ASUrite',
      headerAlign: 'center',
      width: 110,
      editable: (params) => params.row.isNew // Only editable when adding new
    },
     { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 110, cellClassName: 'readonly-cell' },
    {
      field: 'position',
      headerName: 'Position *',
      headerAlign: 'center',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: POSITIONS,
    },
    {
      field: 'fultonFellow',
      headerName: 'Fulton Scholar *',
      headerAlign: 'center',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: FULTON_FELLOW_OPTIONS,
    },
    {
      field: 'weeklyHours',
      headerName: 'Hours *',
      headerAlign: 'center',
      width: 100,
      type: 'singleSelect',
      valueOptions: String(CURRENT_TERM).endsWith('4') ? HOURS_SUMMER : HOURS,
      editable: true,
    },
    { 
      field: 'classNum', 
      headerName: 'Class # *', 
      headerAlign: 'center', 
      width: 120, 
      editable: true 
    },
    {
      field: 'course',
      headerName: 'Course',
      headerAlign: 'center',
      width: 130,
      valueGetter: (value, row) => {
        return `${row.subject} - ${row.catalogNum}`;
      },
      cellClassName: 'readonly-cell',
    },
    { field: 'subject', headerName: 'Subject', headerAlign: 'center', width: 100, cellClassName: 'readonly-cell' },
    { field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', width: 100, type: 'number', cellClassName: 'readonly-cell' },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 100, cellClassName: 'readonly-cell' },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1, minWidth: 150, maxWidth: 250, cellClassName: 'readonly-cell' },
    { field: 'notes', headerName: 'Notes', headerAlign: 'center', flex: 1.5, minWidth: 150, cellClassName: 'readonly-cell' },
    { field: 'status', headerName: 'Status', headerAlign: 'center', flex: 1, minWidth: 100, cellClassName: 'readonly-cell' },
    {
      field: 'actions',
      headerName: 'Actions',
      headerAlign: 'center',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {editingId === params.row.id ? (
            <>
              <SaveIcon
                onClick={() => {
                  if (params.row.isNew) {
                    handleSaveNewRow(params.row.id);
                  } else {
                    handleSaveEdit(params.row.id);
                  }
                }}
                sx={{ cursor: 'pointer', color: 'green' }}
                title="Save"
              />
              <Button
                size="small"
                onClick={handleCancelEdit}
                sx={{ textTransform: 'none', padding: '2px 6px', fontSize: '0.75rem' }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <EditIcon
                onClick={() => {
                  setEditingId(params.row.id);
                  setOriginalEditRow({ ...params.row }); // Store original row for hours comparison
                }}
                sx={{ cursor: 'pointer', color: 'blue' }}
                title="Edit"
              />
              <DeleteIcon
                onClick={() => handleDeleteClick(params.row)}
                sx={{ cursor: 'pointer', color: 'red' }}
                title="Delete"
              />
            </>
          )}
        </Box>
      ),
    },
  ];

  // Check access via permission system
  if (!perms?.program_chair_uploads) {
    return (
      <Paper style={{ padding: 16, margin: 20 }}>
        <Typography color="error">
          Access Denied. Only program chairs can access this page.
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper style={{ padding: 16, margin: 20 }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 1, m: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0.5 }}>
          Program Chair Uploads - Students added by: {asurite}
        </Typography>

        <Box sx={{ p: 1, backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
          <Typography variant="body1" color="textPrimary" sx={{ display: 'block', mb: 0.5 }}>
            <strong>How to add:</strong> Enter ASUrite or Student ID <strong>(not both).</strong> Fill in Required fields <strong>(*)</strong>, then details populate automatically.
          </Typography>
          <Typography variant="body1" color="textPrimary" sx={{ display: 'block' }}>
            <strong>Editing:</strong> You can edit <strong>Position, Hours, Fulton Scholar, and Class #</strong> for existing assignments. To change Student ID/ASUrite, delete the assignment and add a new one.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ height: '700px', width: 'auto', mt: 2, mx: 1 }}>
        <DataGridPro
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          loading={loading}
          pagination
          pageSizeOptions={[25, 50, 100, { value: rows.length, label: 'All' }]}
          processRowUpdate={handleRowUpdate}
          disableSelectionOnClick
          allowColumnReordering
          slots={{
            toolbar: CustomToolbar,
          }}
          showToolbar
          headerFilters
          getRowClassName={getRowClassName}
          getCellClassName={getCellClassName}
          isCellEditable={(params) => {
            // Prevent editing Student ID and ASUrite for existing rows
            if ((params.field === 'student_ID' || params.field === 'asurite') && !params.row.isNew) {
              return false;
            }
            return true;
          }}
          sx={dataGridSx}
        />
      </Box>

      <Box sx={{ mt: 2, mx: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          disabled={editingId !== null}
        >
          Add New Assignment
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this assignment for <strong>{rowToDelete?.studentName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
                  const dlgCap = hoursDialog.sessionData?.cap || 20;
                  const colors = getSessionColor(session.remaining, dlgCap);
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
                          value={getProgressValue(session.remaining, dlgCap)}
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
    </>
  );
}
