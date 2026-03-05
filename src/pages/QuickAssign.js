import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Stepper, Step, StepLabel } from '@mui/material';
import StudentLookup from '../components/StudentLookup';
import ClassLookupCascade from '../components/ClassLookupCascade';
import AssignmentAdder from '../components/AssignmentAdder';

const steps = ['Lookup Student', 'Select Class', 'Create Assignment'];

export default function QuickAssign() {
  const [studentData, setStudentData] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [sessionHours, setSessionHours] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    setStudentData(null);
    setClassDetails(null);
    setSessionHours(null);
    setFormResetKey(prev => prev + 1);
  }, []);

  const onReset = () => {
    setStudentData(null);
    setClassDetails(null);
    setSessionHours(null);
    setFormResetKey(prev => prev + 1);
  };

  // Check if student has remaining hours
  const hasRemainingHours = sessionHours && (
    (sessionHours.remainingA !== undefined && (sessionHours.remainingA > 0 || sessionHours.remainingB > 0 || sessionHours.remainingC > 0)) ||
    (sessionHours.remaining !== undefined && sessionHours.remaining > 0) ||
    (typeof sessionHours === 'number' && sessionHours < 20)
  );

  // Determine active step
  const getActiveStep = () => {
    if (!studentData) return 0;
    if (!classDetails) return 1;
    return 2;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mb: { xs: 2, md: 3 },
          color: '#333',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Quick Assign
      </Typography>

      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
        <StudentLookup
          key={`student-${formResetKey}`}
          setStudentData={setStudentData}
          setSessionHours={setSessionHours}
        />
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
        <ClassLookupCascade key={`class-${formResetKey}`} setClassDetails={setClassDetails} />
      </Paper>

      {studentData && (hasRemainingHours || hasRemainingHours === null) && (
        <Box>
          <AssignmentAdder
            studentData={studentData}
            classDetails={classDetails || {}}
            sessionHours={sessionHours}
            onReset={onReset}
          />
        </Box>
      )}
    </Container>
  );
}
