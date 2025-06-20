import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  Paper, Snackbar, Alert, CircularProgress, Divider, TextField
} from '@mui/material';
import { Stack } from '@mui/material';


const baseUrl = process.env.REACT_APP_API_URL;

if (!baseUrl) {
  console.error("REACT_APP_API_URL is not defined. Make sure it's set in your .env file.");
}

const ClassLookupCascade = ({ setClassDetails }) => {
  const [selectedTerm, setSelectedTerm] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState('');
  const [classNumbers, setClassNumbers] = useState([]);
  const [selectedClassNum, setSelectedClassNum] = useState('');
  const [localClassDetails, setLocalClassDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTerm) {
      const fetchSubjects = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/class/subjects?term=${selectedTerm}`);
          if (!response.ok) throw new Error('Failed to fetch subjects');
          const data = await response.json();
          setSubjects(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchSubjects();
      setSelectedSubject('');
      setCatalogs([]);
      setSelectedCatalog('');
      setClassNumbers([]);
      setSelectedClassNum('');
      setLocalClassDetails(null);
      if (setClassDetails) setClassDetails(null);
    }
  }, [selectedTerm, setClassDetails]);

  useEffect(() => {
    if (selectedTerm && selectedSubject) {
      const fetchCatalogs = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/class/catalog?term=${selectedTerm}&subject=${encodeURIComponent(selectedSubject)}`);
          if (!response.ok) throw new Error('Failed to fetch catalogs');
          const data = await response.json();
          setCatalogs(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchCatalogs();
      setSelectedCatalog('');
      setClassNumbers([]);
      setSelectedClassNum('');
      setLocalClassDetails(null);
      if (setClassDetails) setClassDetails(null);
    }
  }, [selectedSubject, selectedTerm, setClassDetails]);

  useEffect(() => {
    if (selectedTerm && selectedSubject && selectedCatalog) {
      const fetchClassNumbers = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/class/classnumbers?term=${selectedTerm}&subject=${encodeURIComponent(selectedSubject)}&catalogNum=${selectedCatalog}`);
          if (!response.ok) throw new Error('Failed to fetch class numbers');
          const data = await response.json();
          setClassNumbers(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchClassNumbers();
      setSelectedClassNum('');
      setLocalClassDetails(null);
      if (setClassDetails) setClassDetails(null);
    }
  }, [selectedCatalog, selectedSubject, selectedTerm, setClassDetails]);

  useEffect(() => {
    if (selectedTerm && selectedClassNum) {
      setLoading(true);
      const fetchClassDetails = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/class/details/${encodeURIComponent(selectedClassNum)}?term=${selectedTerm}`);
          if (!response.ok) throw new Error('Failed to fetch class details');
          const data = await response.json();
          const mergedDetails = {
            ...data,
            term: selectedTerm,
            subject: selectedSubject,
            catalogNum: selectedCatalog,
            classNum: selectedClassNum,
            location: data.location,
            campus: data.campus,
            acadCareer: data.acadCareer,
          };
          setLocalClassDetails(mergedDetails);
          if (setClassDetails) setClassDetails(mergedDetails);
        } catch (err) {
          setError(err.message);
          if (setClassDetails) setClassDetails(null);
        }
        setLoading(false);
      };
      fetchClassDetails();
    }
  }, [selectedClassNum, selectedTerm, selectedSubject, selectedCatalog, setClassDetails]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3}}>Class Lookup</Typography>

      <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth sx={{ minWidth: 75 }}>
            <InputLabel>Term</InputLabel>
            <Select
              value={selectedTerm}
              label="Term"
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <MenuItem value=""><em>Select Term</em></MenuItem>
              <MenuItem value="2254">2254</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {selectedTerm && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ minWidth: 100 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value=""><em>Select Subject</em></MenuItem>
                {subjects.map((subj, idx) => (
                  <MenuItem key={idx} value={subj}>{subj}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {selectedSubject && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ minWidth: 100 }}>
              <InputLabel>Catalog #</InputLabel>
              <Select
                value={selectedCatalog}
                label="Catalog Number"
                onChange={(e) => setSelectedCatalog(e.target.value)}
              >
                <MenuItem value=""><em>Select Catalog Number</em></MenuItem>
                {catalogs.map((cat, idx) => (
                  <MenuItem key={idx} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {selectedCatalog && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel>Class Number</InputLabel>
              <Select
                value={selectedClassNum}
                label="Class Number"
                onChange={(e) => setSelectedClassNum(e.target.value)}
              >
                <MenuItem value=""><em>Select Class Number</em></MenuItem>
                {classNumbers.map((cls, idx) => (
                  <MenuItem key={idx} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {loading && (
        <Box mt={2}><CircularProgress /></Box>
      )}

      {selectedClassNum && !loading && localClassDetails && (
        <Paper elevation={3} sx={{ padding: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Class Details</Typography>
        <Divider sx={{ mb: 2 }} />
      
        <Stack direction="row" spacing={2} useFlexGap flexWrap="nowrap">
        <TextField
            label="Class"
            disabled
            variant="filled"
            value={`${localClassDetails.subject || ''} - ${localClassDetails.catalogNum || ''}`}
            InputProps={{ readOnly: true }} // Dont need this as it is already disabled
            sx={{ minWidth: 100 }}
          />
          <TextField
            label="Session"
            disabled
            variant="filled"
            value={localClassDetails.Session || ''}
            InputProps={{ readOnly: true }}
            sx={{ width: 100 }}
          />
          <TextField
            label="Instructor ID"
            disabled
            variant="filled"
            value={localClassDetails.InstructorID || ''}
            InputProps={{ readOnly: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Instructor Name"
            disabled
            variant="filled"
            value={`${localClassDetails.InstructorFirstName || ''} ${localClassDetails.InstructorLastName || ''}`}
            InputProps={{ readOnly: true }}
            sx={{ minWidth: 220 }}
          />
          <TextField
            label="Instructor Email"
            disabled
            variant="filled"
            value={localClassDetails.InstructorEmail || ''}
            InputProps={{ readOnly: true }}
            sx={{ minWidth: 250 }}
          />
        </Stack>
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

export default ClassLookupCascade;