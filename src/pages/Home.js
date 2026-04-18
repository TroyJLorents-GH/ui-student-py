import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
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
  Button,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

const MODULES = [
  { label: 'Quick Assign', description: 'Add or update a single student assignment with all position options (Program Chairs).' },
  { label: 'Faculty Grader Assign', description: 'Quickly assign Graders only - streamlined for faculty use.' },
  { label: 'Bulk Upload', description: 'Upload spreadsheets to create or update many assignments at once.' },
  { label: 'Student Assignment Dashboard', description: 'Your course-specific roster of students, roles, and hours.' },
  { label: 'Program Chair Dashboard', description: 'Manage your uploaded assignments - edit, delete, or add new ones.' },
  { label: 'Faculty Grader Dashboard', description: 'View and manage only your Grader assignments.' },
  { label: 'Applications (Masters/PhD)', description: 'Review applicant pools and status for TA/Grader/IA roles.' },
  { label: 'Student Workload Summary', description: 'At-a-glance student assignments with editable features.' },
  { label: 'HR Master Dashboard', description: 'Unified overview of students and assignments across all courses for HR.' },
];

export default function Home() {
  const { asurite, loading } = useAuth();
  const nav = useNavigate();
  const isAuthenticated = !!asurite;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} color="#8c1d40">
          Student Assignment Management System (SAMS)
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, color: 'text.secondary' }}>
          SAMS streamlines how faculty and staff review applicants, create TA/Grader/IA assignments,
          and manage student workloads.
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
          Login is currently using a development flow.
        </Typography>
      </Box>

      {/* Login prompt (shown if unauthenticated) */}
      {!isAuthenticated && (
        <Paper variant="outlined" sx={{ p: 3, mb: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            You're not logged in
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Log in to access SAMS modules available to you.
          </Typography>

          <Button
            disabled={loading}
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => nav('/login')}
            sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' },
            }}
          >
            Dev Login
          </Button>
        </Paper>
      )}

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

      {/* Logged in note */}
      {isAuthenticated && (
        <Typography
          variant="caption"
          sx={{ mt: 3, display: 'block', color: 'text.secondary', textAlign: 'center' }}
        >
          Welcome, {asurite}.
        </Typography>
      )}
    </Container>
  );
}
