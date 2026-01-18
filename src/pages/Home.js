import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';

const MODULES = [
  { label: 'Quick Assign', description: 'Add or update a single student assignment with all position options.' },
  { label: 'Manage Student Assignments', description: 'View and manage all student assignments.' },
  { label: 'Applications', description: 'Review applicant pools and status for TA/Grader/IA roles.' },
  { label: 'Student Summary', description: 'At-a-glance student assignments with editable features.' },
  { label: 'Bulk Upload', description: 'Upload spreadsheets to create or update many assignments at once.' },
  { label: 'Student Assignment Dashboard', description: 'Your course-specific roster of students, roles, and hours.' },
  { label: 'Master Dashboard', description: 'Unified overview of students and assignments across all courses.' },
];

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} color="#1d498c">
          Student Assignment Management System
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, color: 'text.secondary' }}>
          Manage student TA/Grader/IA assignments and workloads.
        </Typography>
      </Box>

      {/* Module list */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Available Modules
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fff' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MODULES.map((m) => (
                <TableRow key={m.label}>
                  <TableCell sx={{ width: '35%', fontWeight: 600 }}>{m.label}</TableCell>
                  <TableCell>{m.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
