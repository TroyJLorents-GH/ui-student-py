// src/pages/Home.js
import React from 'react';
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
import { EventCalendar } from '@mui/x-scheduler/event-calendar';
import { EVENT_CALENDAR_RESOURCES, EVENT_CALENDAR_EVENTS } from '../constants/importantDates';

const MODULES = [
  { label: 'Quick Assign', description: 'Add or update a single student assignment with all position options (Program Chairs).' },
  { label: 'Faculty Grader Assign', description: 'Quickly assign Graders only - streamlined for faculty use.' },
  { label: 'Bulk Upload', description: 'Upload spreadsheets to create or update many assignments at once.' },
  { label: 'Student Assignment Dashboard', description: 'Your course-specific roster of students, roles, and hours.' },
  { label: 'Program Chair Dashboard', description: 'Manage your uploaded assignments - edit, delete, or add new ones.' },
  { label: 'Faculty Grader Dashboard', description: 'View and manage only your Grader assignments.' },
  { label: 'Applications (Masters/PhD)', description: 'Review applicant pools and status for TA/Grader/IA roles.' },
  { label: 'Edit Student Assignment', description: 'At-a-glance student assignments with editable features.' },
  { label: 'HR Master Dashboard', description: 'Unified overview of students and assignments across all courses for HR.' },
];

export default function Home() {
  const { asurite, login, loading, USE_CAS, USE_MOCK } = useAuth();
  const isAuthenticated = !!asurite;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} color="#8c1d40">
          Student Assignment Management System (SAMS)
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, color: 'text.secondary' }}>
          SAMS streamlines how University faculty and staff review applicants, create TA/Grader/IA assignments,
          and manage student workloads.
        </Typography>

        {/* Only show the dev note if NOT using CAS */}
        {!USE_CAS && (
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            Login is currently using a development flow and will be replaced with CAS Single Sign-On (SSO).
          </Typography>
        )}
      </Box>

      {/* Login prompt (shown if unauthenticated) */}
      {!isAuthenticated && (
        <Paper variant="outlined" sx={{ p: 3, mb: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            You’re not logged in
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Log in to access SAMS modules available to you.
          </Typography>

          <Button
            disabled={loading}
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={login}
            sx={{
              backgroundColor: '#8c1d40',
              '&:hover': { backgroundColor: '#701831' },
            }}
          >
            {USE_CAS ? 'Sign in with ASU CAS' : (USE_MOCK ? 'Dev Login (Mock)' : 'Dev Login')}
          </Button>
        </Paper>
      )}

      {/* Important Dates Calendar */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Important Dates
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ height: 640 }}>
            <EventCalendar
              events={EVENT_CALENDAR_EVENTS}
              resources={EVENT_CALENDAR_RESOURCES}
              defaultVisibleDate={new Date(2026, 5, 1)}
              defaultView="month"
              views={['week', 'month', 'agenda']}
              defaultPreferences={{ isSidePanelOpen: false }}
              readOnly
            />
          </Box>
        </Paper>
      </Box>

      {/* Module list */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Available Pages
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#ffff' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Pages</TableCell>
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
          Welcome, {asurite || 'faculty member'}.
        </Typography>
      )}
    </Container>
  );
}
