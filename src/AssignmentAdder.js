import React, { useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField,
  Checkbox, FormControlLabel, Button, Snackbar, Alert, Grid, Divider, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { computeCostCenterKey } from './costCenterRules';

const baseUrl = process.env.REACT_APP_API_URL;

if (!baseUrl) {
  console.error("REACT_APP_API_URL is not defined. Make sure it's set in your .env file.");
}


const AssignmentAdder = ({ studentData, classDetails, onReset }) => {
  const [weeklyHours, setWeeklyHours] = useState('');
  const [fultonFellow, setFultonFellow] = useState('');
  const [position, setPosition] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [assignmentSummary, setAssignmentSummary] = useState(null);

  const session = classDetails?.ClassSession || classDetails?.Session || '';

  const calculateComp = (pos, hours, edu, fellow, session) => {
    const h = parseInt(hours, 10);
    if (isNaN(h)) return 0;
    if (pos === "TA") {
      if (h === 10 && edu === "MS" && fellow === "No") return 6636;
      if (h === 10 && edu === "PHD" && fellow === "No") return 7250;
      if (h === 20 && (edu === "MS" || edu === "Masters") && fellow === "No") return 13272;
      if (h === 20 && edu === "PHD" && fellow === "No") return 14500;
      if (h === 20 && edu === "PHD" && fellow === "Yes") return 13461.24;
    }
    if (pos === "TA (GSA) 1 credit") {
      if (h === 10 && edu === "PHD" && fellow === "No") return 7552.5;
      if (h === 20 && edu === "PHD" && fellow === "No") return 16825;
    }
    if (pos === "IA") {
      const base = session === "C" ? 2 : 1;
      if (["MS", "PHD"].includes(edu)) {
        return base * 1100 * (h / 5);
      }
    }
    return 0;
  };

  const compensation = calculateComp(position, weeklyHours, studentData?.Degree, fultonFellow, session);
  const costCenter = computeCostCenterKey(position, classDetails?.Location, classDetails?.Campus, classDetails?.AcadCareer);

  
  const handleSubmit = async () => {
    if (!studentData || !acknowledged) {
      return setSnackbar({
        open: true,
        message: !studentData ? "Missing student data" : "You must acknowledge the assignment",
        severity: 'error'
      });
    }

    const payload = {
      Student_ID: studentData.Student_ID,
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
      InstructorFirstName: classDetails?.InstructorFirstName || '',
      InstructorLastName: classDetails?.InstructorLastName || '',
      WeeklyHours: parseInt(weeklyHours, 10),
      FultonFellow: fultonFellow,
      Compensation: compensation,
      Location: classDetails?.Location || '',
      Campus: classDetails?.Campus || '',
      AcadCareer: classDetails?.AcadCareer || '',
      CostCenterKey: costCenter
    };

    try {
      const res = await fetch(`${baseUrl}/api/StudentClassAssignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to submit');
      setAssignmentSummary(payload);
      setModalOpen(true);
      setSnackbar({ open: true, message: 'Assignment added!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setAssignmentSummary(null);
    setWeeklyHours('');
    setFultonFellow('');
    setPosition('');
    setAcknowledged(false);

    if (typeof onReset === 'function') onReset(); // call back to App.js
  };

  const studentName = studentData ? `${studentData.first_Name} ${studentData.last_Name}` : '';
  const classLabel = classDetails ? `${classDetails.subject} ${classDetails.catalogNum}` : '';
  const acknowledgeText = `I agree to hiring ${studentName} for ${position} at $${compensation.toLocaleString()} for ${classLabel}`;

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Add Student Assignment
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
                sx={{ width: 200 }} 
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
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ minWidth: 250 }} required>
            <InputLabel>Position</InputLabel>
            <Select value={position} onChange={(e) => setPosition(e.target.value)} label="Position">
              <MenuItem value="Grader">Grader</MenuItem>
              <MenuItem value="TA">TA</MenuItem>
              <MenuItem value="TA (GSA) 1 credit">TA (GSA) 1 credit</MenuItem>
              <MenuItem value="IA">IA</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ minWidth: 250 }} required>
            <InputLabel>Weekly Hours</InputLabel>
            <Select value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} label="Weekly Hours">
              {[5, 10, 15, 20].map(h => (
                <MenuItem key={h} value={h}>{h}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ minWidth: 250 }} required>
            <InputLabel>Fulton Fellow</InputLabel>
            <Select value={fultonFellow} onChange={(e) => setFultonFellow(e.target.value)} label="Fulton Fellow">
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
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
          <TextField label="Compensation" value={`$${compensation.toLocaleString()}`} disabled InputLabelProps={{ shrink: true }} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Cost Center Key" value={costCenter} disabled InputLabelProps={{ shrink: true }} fullWidth />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" color="primary" disabled={!acknowledged} onClick={handleSubmit}>
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
      <Dialog open={modalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
        <DialogTitle>Assignment Confirmation - Print For Own Records</DialogTitle>
        <DialogContent dividers>
          {assignmentSummary && (
            <Box>
              <Typography><strong>Student:</strong> {assignmentSummary.First_Name} {assignmentSummary.Last_Name}</Typography>
              <Typography><strong>Student ID:</strong> {assignmentSummary.Student_ID}</Typography>
              <Typography><strong>Email:</strong> {assignmentSummary.Email}</Typography>
              <Typography><strong>Education Level:</strong> {assignmentSummary.EducationLevel}</Typography>
              <Typography><strong>Position:</strong> {assignmentSummary.Position}</Typography>
              <Typography><strong>Class #:</strong> {assignmentSummary.ClassNum}</Typography>
              <Typography><strong>Course:</strong> {assignmentSummary.Subject} - {assignmentSummary.CatalogNum}</Typography>
              <Typography><strong>Session:</strong> {assignmentSummary.ClassSession}</Typography>
              <Typography><strong>Instructor:</strong> {assignmentSummary.InstructorFirstName} {assignmentSummary.InstructorLastName}</Typography>
              <Typography><strong>Weekly Hours:</strong> {assignmentSummary.WeeklyHours}</Typography>
              <Typography><strong>Fulton Fellow:</strong> {assignmentSummary.FultonFellow}</Typography>
              <Typography><strong>Compensation:</strong> ${assignmentSummary.Compensation.toLocaleString()}</Typography>
              <Typography><strong>Cost Center:</strong> {assignmentSummary.CostCenterKey}</Typography>
              
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.print()} color="secondary">Print</Button>
          <Button onClick={handleModalClose} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AssignmentAdder;