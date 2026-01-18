// **********************  Able to use the Student Id or ASUrite ID to search for a student *********************

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Grid, Paper, TextField, Typography,
  Snackbar, Alert, Divider, Stack, AlertTitle, Card, CardContent, LinearProgress
} from '@mui/material';

// Helper function to get color based on remaining hours
const getSessionColor = (remaining) => {
  if (remaining === 0) return { main: '#d32f2f', light: '#ffebee', text: '#c62828' }; // Red
  if (remaining <= 10) return { main: '#f57c00', light: '#fff3e0', text: '#e65100' }; // Orange/Yellow
  return { main: '#2e7d32', light: '#e8f5e9', text: '#1b5e20' }; // Green
};

// Calculate progress percentage (hours used out of 20)
const getProgressValue = (remaining) => ((20 - remaining) / 20) * 100;

const baseUrl = process.env.REACT_APP_API_BASE;

if (!baseUrl) {
  console.error("REACT_APP_API_BASE is not defined. Make sure it's set in your .env file.");
}

const StudentLookup = ({ setStudentData, setSessionHours }) => {
  const [studentIDInput, setStudentIDInput] = useState('');
  const [localStudentData, setLocalStudentData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [localSessionHours, setLocalSessionHours] = useState(null);

  const handleStudentSearch = async () => {
    setError('');
    setLoading(true);

    try {
      const trimmedInput = studentIDInput.trim();
      let url = '';

      if (!trimmedInput) throw new Error('Please enter a Student ID or ASUrite ID');

      if (!isNaN(trimmedInput)) {
        url = `${baseUrl}/api/StudentLookup/${parseInt(trimmedInput, 10)}`;
      } else {
        url = `${baseUrl}/api/StudentLookup/${trimmedInput}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Student not found');

      const data = await response.json();
      setLocalStudentData(data);
      if (setStudentData) setStudentData(data);
    } catch (err) {
      setError(err.message);
      setLocalStudentData(null);
      if (setStudentData) setStudentData(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (localStudentData) {
      const fetchSessionHours = async () => {
        try {
          const res = await fetch(`${baseUrl}/api/StudentClassAssignment/totalhours/${localStudentData.Student_ID}`);
          if (!res.ok) throw new Error('Failed to fetch assigned hours');
          const data = await res.json();

          // Handle both session-based response and simple total response
          if (typeof data === 'object' && data.remainingA !== undefined) {
            // Session-based hours: { hoursA, hoursB, hoursC, remainingA, remainingB, remainingC, total }
            setLocalSessionHours(data);
            if (setSessionHours) setSessionHours(data);
          } else {
            // Simple total hours (number) - convert to session format for compatibility
            const total = typeof data === 'number' ? data : 0;
            const remaining = Math.max(20 - total, 0);
            const sessionData = {
              total,
              remaining,
              remainingA: remaining,
              remainingB: remaining,
              remainingC: remaining,
              hoursA: total,
              hoursB: total,
              hoursC: total,
            };
            setLocalSessionHours(sessionData);
            if (setSessionHours) setSessionHours(sessionData);
          }
        } catch (err) {
          console.error(err);
          setLocalSessionHours(null);
          if (setSessionHours) setSessionHours(null);
        }
      };
      fetchSessionHours();
    }
  }, [localStudentData, setSessionHours]);

  const toggleAddForm = () => setShowAddForm(prev => !prev);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Student Lookup
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            label="Student ID or ASUrite"
            variant="outlined"
            required
            fullWidth
            value={studentIDInput}
            onChange={(e) => setStudentIDInput(e.target.value)}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <Button variant="contained" color="primary" fullWidth onClick={handleStudentSearch} disabled={loading}>
            Search
          </Button>
        </Grid>
        <Grid item xs={6} md={2}>
          <Button variant="contained" color="success" fullWidth onClick={toggleAddForm}>
            {showAddForm ? 'Hide Add Student' : 'Add Student'}
          </Button>
        </Grid>
      </Grid>

      {loading && <Typography mt={2}>Loading student...</Typography>}

      {localStudentData && localStudentData.Student_ID && (
        <Paper elevation={3} sx={{ padding: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>Student Details</Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={2} useFlexGap flexWrap="nowrap">
            <TextField disabled variant="filled" label="Student ID" value={localStudentData.Student_ID} sx={{ width: 180 }} />
            <TextField disabled variant="filled" label="First Name" value={localStudentData.First_Name} sx={{ width: 180 }} />
            <TextField disabled variant="filled" label="Last Name" value={localStudentData.Last_Name} sx={{ width: 180 }} />
            <TextField disabled variant="filled" label="Email" value={localStudentData.ASU_Email_Adress} sx={{ width: 250 }} />
            <TextField disabled variant="filled" label="Education Level" value={localStudentData.Degree} sx={{ width: 150 }} />
          </Stack>

          {localSessionHours !== null && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Remaining Hours by Session
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                {[
                  { label: 'Session A', remaining: localSessionHours.remainingA, subtitle: 'First Half' },
                  { label: 'Session B', remaining: localSessionHours.remainingB, subtitle: 'Second Half' },
                  { label: 'Session C', remaining: localSessionHours.remainingC, subtitle: 'Full Semester' },
                ].map((session) => {
                  const colors = getSessionColor(session.remaining);
                  return (
                    <Card
                      key={session.label}
                      sx={{
                        minWidth: 140,
                        backgroundColor: colors.light,
                        border: `2px solid ${colors.main}`,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="caption" sx={{ color: '#000', fontWeight: 600 }}>
                          {session.label}
                        </Typography>
                        <Typography variant="h4" sx={{ color: colors.text, fontWeight: 'bold', my: 0.5 }}>
                          {session.remaining}h
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressValue(session.remaining)}
                          sx={{
                            height: 6,
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

          {localSessionHours !== null && localSessionHours.remainingA === 0 && localSessionHours.remainingB === 0 && localSessionHours.remainingC === 0 && (
            <Alert severity="error" sx={{ mt: 3 }}>
              <AlertTitle>Cannot Assign Student</AlertTitle>
              <strong>{localStudentData.First_Name} {localStudentData.Last_Name}</strong> has reached 20 hours for all sessions and cannot be assigned to any additional positions.
            </Alert>
          )}
        </Paper>
      )}

      {showAddForm && (
        <Paper elevation={1} sx={{ padding: 3, mt: 4, border: '2px dashed #28a745' }}>
          <Typography variant="h5" gutterBottom>Add New Student</Typography>
          <Typography>This is where your Add Student form will go.</Typography>
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentLookup;
