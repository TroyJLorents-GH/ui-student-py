// src/pages/StudentAssignmentDashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { CustomToolbar, getDataGridSx } from '../utils/dataGridStyles';

const baseUrl = process.env.REACT_APP_API_URL;

// Filter options for Position
const POSITION_OPTIONS = [
  'All',
  'TA',
  'Grader',
  'IA',
  'TA (GSA) 1 credit',
  'TA (GSA) 1 credit +',
];


export default function StudentAssignmentDashboard() {
  const theme = useTheme();
  const dataGridSx = useMemo(() => getDataGridSx(theme), [theme]);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [filteredRows, setFilteredRows] = useState([]);
  const [positionFilter, setPositionFilter] = useState('All');

  // Using flex for responsive auto-resize layout (no horizontal scroll)
  const columns = [
    { field: 'studentName', headerName: 'Student Name', headerAlign: 'center', flex: 1.5, minWidth: 130 },
    { field: 'student_ID', headerName: 'ASU ID', headerAlign: 'center', flex: 0.9, minWidth: 100 },
    { field: 'asuRite', headerName: 'ASUrite', headerAlign: 'center', flex: 0.8, minWidth: 90 },
    { field: 'position', headerName: 'Position', headerAlign: 'center', flex: 1, minWidth: 110 },
    { field: 'weeklyHours', headerName: 'Hours', headerAlign: 'center', flex: 0.5, minWidth: 60, type: 'number' },
    { field: 'fultonFellow', headerName: 'Fulton Scholar', headerAlign: 'center', flex: 0.8, minWidth: 90 },
    { field: 'email', headerName: 'Email', headerAlign: 'center', flex: 1.4, minWidth: 150 },
    { field: 'educationLevel', headerName: 'Education', headerAlign: 'center', width: 120 },
    { field: 'instructorName', headerName: 'Instructor Name', headerAlign: 'center', flex: 1.2, minWidth: 130 },
    //{ field: 'subject', headerName: 'Subject', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    //{ field: 'catalogNum', headerName: 'Catalog #', headerAlign: 'center', flex: 0.7, minWidth: 80, type: 'number' },
    {
      field: 'course',
      headerName: 'Course',
      headerAlign: 'center',
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => {
        return `${row.subject} - ${row.catalogNum}`;
      }
    },
    { field: 'classNum', headerName: 'Class Number', headerAlign: 'center', flex: 0.9, minWidth: 90 },
    { field: 'classSession', headerName: 'Session', headerAlign: 'center', width: 120 },
    {
      field: 'otherPositions',
      headerName: 'Additional Assignments',
      headerAlign: 'center',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return '-';
        return (
          <div style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            fontSize: '0.9em',
            padding: '4px',
            maxHeight: '100%',
            overflow: 'visible'
          }}>
            {value}
          </div>
        );
      }
    },
    { field: 'location', headerName: 'Location', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    { field: 'campus', headerName: 'Campus', headerAlign: 'center', flex: 0.7, minWidth: 80 },
    //{ field: 'cum_gpa', headerName: 'Cum GPA', headerAlign: 'center', flex: 0.6, minWidth: 70 },
    //{ field: 'cur_gpa', headerName: 'Cur GPA', headerAlign: 'center', flex: 0.6, minWidth: 70 },
    { field: 'importedBy', headerName: 'Imported By', headerAlign: 'center', width: 110 },
    // intentionally removed: Cost Center, Compensation, Review, Position Number, Reviewed, Date Created
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/faculty/student-assignments`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load assignments');
        return res.json();
      })
      .then(data => {
        // First, group all assignments by student to collect their classes
        const studentAssignments = {};

        data.forEach(r => {
          const studentId = r.Student_ID;
          if (!studentAssignments[studentId]) {
            studentAssignments[studentId] = [];
          }
          studentAssignments[studentId].push({
            catalogNum: r.CatalogNum,
            subject: r.Subject,
            position: r.Position,
          });
        });

        // Now map the data, keeping all rows, and adding otherPositions to each
        const mapped = data.map(r => {
          const studentId = r.Student_ID;
          const allAssignments = studentAssignments[studentId] || [];

          // Filter out the current assignment to get "other" positions
          const otherAssignments = allAssignments.filter(
            a => !(a.catalogNum === r.CatalogNum && a.subject === r.Subject)
          );

          return {
            id: r.Id,
            studentName: `${r.First_Name ?? ''} ${r.Last_Name ?? ''}`.trim(),
            student_ID: r.Student_ID,
            asuRite: r.ASUrite,
            position: r.Position,
            weeklyHours: r.WeeklyHours,
            fultonFellow: r.FultonFellow,
            email: r.Email,
            educationLevel: r.EducationLevel,
            instructorName: `${r.InstructorFirstName ?? ''} ${r.InstructorLastName ?? ''}`.trim(),
            subject: r.Subject,
            catalogNum: r.CatalogNum,
            classSession: r.ClassSession,
            location: r.Location,
            campus: r.Campus,
            classNum: r.ClassNum,
            classSection: r.ClassSection,
            cum_gpa: r.cum_gpa,
            cur_gpa: r.cur_gpa,
            importedBy: r.ImportedBy || '',
            otherPositions: otherAssignments.length > 0
              ? otherAssignments.map(a => `${a.subject} - ${a.catalogNum} (${a.position})`).join('\n')
              : '',
          };
        });

        setRows(mapped);
        setError('');
      })
      .catch(err => {
        setError(err.message || 'Error loading data');
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // // --- Filter logic ---
  // const handlePositionChange = (e) => {
  //   setPositionFilter(e.target.value);
  // };

  const visibleRows = useMemo(() => {
    if (positionFilter === 'All') return rows;
    const wanted = positionFilter.toLowerCase();
    return rows.filter(r =>
      (r.position ?? '').toLowerCase() === wanted ||
      (wanted === 'ta (gsa) 1 credit' &&
        ['ta gsa 1 credit', 'ta gsa', 'ta (gsa)'].includes((r.position ?? '').toLowerCase()))
    );
  }, [rows, positionFilter]);

  // Striped rows function
  const getRowClassName = (params) => {
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
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Student Assignment Dashboard
        </Typography>
        <Chip
          label={`${visibleRows.length} records`}
          size="small"
          variant="outlined"
          color="primary"
        />
      </Box>

      <Box mb={2}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Position</InputLabel>
          <Select
            value={positionFilter}
            label="Position"
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            {POSITION_OPTIONS.map((pos) => (
              <MenuItem key={pos} value={pos}>
                {pos}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Helper text */}
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        Tip: Click the <b>Columns</b> <ViewColumnIcon sx={{ fontSize: '1.25rem', verticalAlign: 'text-bottom', display: 'inline' }} /> button in the toolbar to show more fields or drag to reorder.
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          Error: {error}
        </Typography>
      )}

      <div style={{ height: 'calc(100vh - 200px)', width: '100%', minWidth: '100%' }}>

      <DataGridPro
        sx={dataGridSx}
        rows={visibleRows}
        columns={columns}
        getRowClassName={getRowClassName}
        loading={loading}
        pagination
        initialState={{
          pagination: { paginationModel: { pageSize: 50, page: 0 } },
          density: 'standard',
        }}
        pageSizeOptions={[25, 50, 100, { value: visibleRows.length, label: 'All' }]}
        disableSelectionOnClick
        allowColumnReordering
        slots={{
          toolbar: CustomToolbar,
        }}
        showToolbar
        headerFilters
      />
    </div>
    </Paper>
  );
}
