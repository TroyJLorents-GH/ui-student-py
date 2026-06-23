import React, { useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField,
  Checkbox, FormControlLabel, Button, Snackbar, Alert, Grid, Divider, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { computeCostCenterKey } from '../utils/costCenterRules';

const baseUrl = process.env.REACT_APP_API_URL;

if (!baseUrl) {
  console.error("REACT_APP_API_URL is not defined. Make sure it's set in your .env file.");
}


const FacultyAssignmentAdder = ({ studentData, classDetails, sessionHours, onReset }) => {
  const [weeklyHours, setWeeklyHours] = useState('');
  const [position] = useState('Grader'); // Fixed to Grader only
  const [acknowledged, setAcknowledged] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [assignmentSummary, setAssignmentSummary] = useState(null);

  const session = classDetails?.ClassSession || classDetails?.Session || '';
  const sessionUpper = (session || '').toUpperCase().trim();

  // Cap from backend (40 in summer, else 20). Fallback uses class Term.
  const isSummer = String(classDetails?.Term || '').endsWith('4');
  const cap = sessionHours?.cap || (isSummer ? 40 : 20);

  // Get remaining hours for the selected class session (DYN counts as C)
  const getRemainingForSession = () => {
    if (!sessionHours) return cap;
    if (sessionUpper === 'A') return sessionHours.remainingA;
    if (sessionUpper === 'B') return sessionHours.remainingB;
    if (sessionUpper === 'C' || sessionUpper === 'DYN') return sessionHours.remainingC;
    return cap;
  };

  const remainingForSession = getRemainingForSession();

  // Hour increments scale with cap (summer = up to 40, else up to 20)
  const hourOptions = cap >= 40 ? [5, 10, 15, 20, 25, 30, 35, 40] : [5, 10, 15, 20];
  const availableHours = hourOptions.filter(hours => hours <= remainingForSession);

  const calculateComp = (pos, hours, edu, fellow, session, term) => {
  const h = parseInt(hours, 10);
  const sess = String(session || "").toUpperCase();
  const degree = String(edu || "").toUpperCase();
  const ff = fellow || "No"; // keep legacy default-to-No

  // --- Summer terms (ending in 4) ---
  if (term && String(term).endsWith("4")) {
    const sessionMultiplier = { A: 2.5, B: 4, C: 5, DYN: 5 }[sess] || 0;
    if (pos === "Grader") return Math.round(15.62 * (h * 2) * sessionMultiplier * 100) / 100;
    if (pos === "IA") return Math.round(22.00 * (h * 2) * sessionMultiplier * 100) / 100;
    return 0;
  }

  // --- Spring/Fall ---

  // --- Grader (BS, MS or PHD, Fellow: No) ---
  if (pos === "Grader" && (degree === "BS" || degree === "MS" || degree === "PHD") && ff === "No") {
    if (h === 5)  { if (sess === "C") return 1562; if (sess === "A" || sess === "B") return 781; }
    if (h === 10) { if (sess === "C") return 3124; if (sess === "A" || sess === "B") return 1562; }
    if (h === 15) { if (sess === "C") return 4686; if (sess === "A" || sess === "B") return 2343; }
    if (h === 20) { if (sess === "C") return 6248; if (sess === "A" || sess === "B") return 3124; }
  }

  return 0;
};

  const compensation = calculateComp(position, weeklyHours, studentData?.Degree, "No", session, classDetails?.Term);
  const costCenter = computeCostCenterKey(position, classDetails?.Location, classDetails?.Campus, classDetails?.AcadCareer, classDetails?.Term);


  const handleSubmit = async () => {
    if (!studentData || !acknowledged) {
      return setSnackbar({
        open: true,
        message: !studentData ? "Missing student data" : "You must acknowledge the assignment",
        severity: 'error'
      });
    }

    // Validate hours against session limit
    const hoursToAdd = parseInt(weeklyHours, 10);
    if (hoursToAdd > remainingForSession) {
      return setSnackbar({
        open: true,
        message: `Cannot add ${hoursToAdd} hours. Student only has ${remainingForSession} hours remaining for Session ${sessionUpper}.`,
        severity: 'error'
      });
    }

    const payload = {
      Student_ID: studentData.Student_ID,
      ASUrite: studentData.ASUrite,
      Position: position,
      Email: studentData.ASU_Email_Adress,
      First_Name: studentData.First_Name,
      Last_Name: studentData.Last_Name,
      EducationLevel: studentData.Degree,
      Subject: classDetails?.subject || '',
      CatalogNum: classDetails?.catalogNum || '',
      ClassSession: session,
      ClassNum: classDetails?.classNum || '',
      Term: classDetails?.Term || '',
      InstructorFirstName: classDetails?.InstructorFirstName && classDetails.InstructorFirstName.trim() ? classDetails.InstructorFirstName : 'Staff TBD',
      InstructorLastName: classDetails?.InstructorLastName && classDetails.InstructorLastName.trim() ? classDetails.InstructorLastName : 'Staff TBD',
      InstructorID: classDetails?.InstructorID && classDetails.InstructorID !== '' ? parseInt(classDetails.InstructorID, 10) : null,
      InstructorEmail: classDetails?.InstructorEmail || null,
      WeeklyHours: parseInt(weeklyHours, 10),
      FultonFellow: "No", // Always No for faculty graders
      Compensation: compensation,
      Location: classDetails?.Location || '',
      Campus: classDetails?.Campus || '',
      AcadCareer: classDetails?.AcadCareer || '',
      CostCenterKey: costCenter,
      cum_gpa: +(parseFloat(studentData?.Cumulative_GPA)?.toFixed(2)) || 0,
      cur_gpa: +(parseFloat(studentData?.Current_GPA)?.toFixed(2)) || 0
    };

    try {
      const res = await fetch(`${baseUrl}/api/StudentClassAssignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to submit');
      setAssignmentSummary(payload);
      setModalOpen(true);
      // Set custom document title for printing
      document.title = `Assignment - ${payload.First_Name} ${payload.Last_Name} - ${payload.Subject}${payload.CatalogNum}`;
      setSnackbar({ open: true, message: 'Assignment added!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setAssignmentSummary(null);
    setWeeklyHours('');
    setAcknowledged(false);
    // Restore original title
    document.title = 'Student Assignment System';

    if (typeof onReset === 'function') onReset(); // call back to App.js
  };

  const studentName = studentData ? `${studentData.First_Name} ${studentData.Last_Name}` : '';
  const classLabel = classDetails ? `${classDetails.Subject} ${classDetails.CatalogNum}` : '';
  const acknowledgeText = `I agree to hiring ${studentName} as a Grader at $${compensation.toLocaleString()} for ${classLabel}`;

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Add Grader Assignment
      </Typography>

      {/* STUDENT INFO */}
      {studentData && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Student Info</Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
              <TextField
                label="Student ID"
                disabled
                value={studentData.Student_ID}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 160 }}
              />
              <TextField
                label="Name"
                disabled
                value={`${studentData.First_Name} ${studentData.Last_Name}`}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
              />
              <TextField
                label="Email"
                disabled
                value={studentData.ASU_Email_Adress}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 250 }}
              />
              <TextField
                label="Education Level"
                disabled
                value={studentData.Degree}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 160 }}
              />
            </Box>
          </Paper>
        </Box>
      )}

      {/* CLASS INFO */}
      {classDetails && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Class Info</Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
              <TextField
                label="Course"
                disabled
                value={`${classDetails.subject} - ${classDetails.catalogNum}`}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 180 }}
              />
              <TextField
                label="Class #" value={classDetails.classNum}
                disabled
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 120 }}
              />
              <TextField
                label="Session"
                disabled
                value={classDetails.Session}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 100 }}
              />
              <TextField
                label="Location"
                disabled
                value={`${classDetails.Location} - ${classDetails.Campus}`}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 275 }}
              />
              <TextField
                label="Instructor"
                disabled
                value={`${classDetails.InstructorFirstName} ${classDetails.InstructorLastName}`}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 'auto' }}
              />
              <TextField
                label="Instructor Email"
                disabled
                value={classDetails.InstructorEmail}
                variant='filled'
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 300 }}
              />
            </Box>
          </Paper>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* FORM FIELDS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ minWidth: 250 }}>
            <InputLabel>Position</InputLabel>
            <Select value={position} disabled label="Position">
              <MenuItem value="Grader">Grader</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ minWidth: 250 }} required>
            <InputLabel>Weekly Hours</InputLabel>
            <Select value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} label="Weekly Hours">
              {availableHours.map(h => (
                <MenuItem key={h} value={h}>{h}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {sessionUpper && remainingForSession !== null && (
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: remainingForSession > 0 ? 'success.main' : 'error.main' }}>
              {remainingForSession} hours remaining for Session {sessionUpper}
            </Typography>
          )}
        </Grid>
      </Grid>

      <Box mt={3}>
        <FormControlLabel
          control={<Checkbox checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />}
          label={acknowledgeText}
        />
      </Box>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
           label="Compensation"
           value={`$${compensation.toLocaleString()}`}
           disabled
           InputLabelProps={{ shrink: true }}
           fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
           label="Cost Center Key"
           value={costCenter}
           disabled
           InputLabelProps={{ shrink: true }}
           fullWidth />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained"
         sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' },
            }}
          disabled={!acknowledged} onClick={handleSubmit}>
          Add Assignment
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ✅ Clean Confirmation Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            '@media print': {
              boxShadow: 'none',
              margin: 0,
              maxWidth: '100%'
            }
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 50, color: '#2e7d32', mb: 1, '@media print': { display: 'none' } }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Assignment Created Successfully
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, '@media print': { display: 'none' } }}>
            Print for your records
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {assignmentSummary && (
            <Box>
              {/* Student Information */}
              <Paper elevation={0} sx={{
                p: 2,
                mb: 2,
                backgroundColor: '#f5f5f5',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#8c1d40' }}>
                  Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.First_Name} {assignmentSummary.Last_Name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Student ID</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.Student_ID}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.Email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Education Level</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.EducationLevel}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Course Information */}
              <Paper elevation={0} sx={{
                p: 2,
                mb: 2,
                backgroundColor: '#f5f5f5',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#8c1d40' }}>
                  Course Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Course</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.Subject} - {assignmentSummary.CatalogNum}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Class #</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.ClassNum}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Session</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.ClassSession}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Instructor</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.InstructorFirstName} {assignmentSummary.InstructorLastName}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Assignment Details */}
              <Paper elevation={0} sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#8c1d40' }}>
                  Assignment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Position</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.Position}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Weekly Hours</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {assignmentSummary.WeeklyHours}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Compensation</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                      ${assignmentSummary.Compensation.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Cost Center</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {assignmentSummary.CostCenterKey}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            '@media print': {
              display: 'none'
            }
          }}
        >
          <Button
            onClick={() => window.print()}
            variant="outlined"
            sx={{ color: '#2e7d32', borderColor: '#2e7d32', '&:hover': { borderColor: '#1b5e20', backgroundColor: 'rgba(46,125,50,0.04)' } }}
          >
            Print
          </Button>
          <Button
            onClick={handleModalClose}
            variant="contained"
            sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FacultyAssignmentAdder;
