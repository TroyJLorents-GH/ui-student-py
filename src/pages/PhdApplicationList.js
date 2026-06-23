import React, { useState, useEffect } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Paper,
  Typography
} from '@mui/material';

const baseUrl = process.env.REACT_APP_API_URL;

if (!baseUrl) {
  console.error("REACT_APP_API_URL is not defined. Make sure it's set in your .env file.");
}

const PhdApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${baseUrl}/api/PhdApplication/`);
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchApplications();
  }, []);

  const columns = [
    // { field: 'Id', headerName: 'ID', headerAlign: 'center', width: 70 },
    { field: 'Name', headerName: 'Name', headerAlign: 'center', flex: 1 },
    { field: 'Email', headerName: 'Email', headerAlign: 'center', flex: 1.2 },
    { field: 'ASU10DigitID', headerName: 'ASU ID', headerAlign: 'center', width: 120 },
    { field: 'DegreeProgram', headerName: 'Degree Program', headerAlign: 'center', flex: 1.2 },
    { field: 'GraduateGPA', headerName: 'Grad GPA', headerAlign: 'center', width: 110 },
    { field: 'UndergraduateGPA', headerName: 'UG GPA', headerAlign: 'center', width: 110 },
    { field: 'UndergraduateInstitution', headerName: 'UG Institution', headerAlign: 'center', flex: 1 },
    { field: 'PositionsConsidered', headerName: 'Positions', headerAlign: 'center', width: 160 },
    { field: 'HoursAvailable', headerName: 'Hours Available', headerAlign: 'center', width: 130 },
    { field: 'PreferredCourses', headerName: 'Preferred Courses', headerAlign: 'center', flex: 1 },
    // { field: 'StartOfPhdYear', headerName: 'PhD Start Year', headerAlign: 'center', width: 130 },
    { field: 'ProgrammingLanguages', headerName: 'Programming Languages', headerAlign: 'center', flex: 1 },
    { field: 'DissertationProposalStatus', headerName: 'Thesis Proposal', headerAlign: 'center', width: 180 },
    {
      field: 'ExpectedGraduation',
      headerName: 'Expected Grad',
      headerAlign: 'center',
      width: 140,
      renderCell: (params) => {
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      }
    },
    {
      field: 'TranscriptUrl',
      headerName: 'Transcript',
      headerAlign: 'center',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <a href={params.value} target="_blank" rel="noopener noreferrer">View</a>
        ) : 'N/A'
    },
    {
      field: 'ResumeUrl',
      headerName: 'Resume',
      headerAlign: 'center',
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <a href={params.value} target="_blank" rel="noopener noreferrer">View</a>
        ) : 'N/A'
    }
  ];

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h5" gutterBottom>
        PhD Application List
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          Error: {error}
        </Typography>
      )}

      <div style={{ height: 'fit-content', width: '100%' }}>
        <DataGridPro
          initialState={{density: 'compact'}}
          rows={applications}
          columns={columns}
          getRowId={(row) => row.Id}
          pageSize={20}
          rowsPerPageOptions={[10, 20, 50]}
          loading={loading}
          showToolbar
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              fontSize: '1.05rem'
            },
            '& .MuiDataGrid-cell': {
              textAlign: 'center'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f9f9f9'
            }
          }}
        />
      </div>
    </Paper>
  );
};

export default PhdApplicationList;
