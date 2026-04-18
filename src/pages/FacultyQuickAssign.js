import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Paper } from '@mui/material';
import StudentLookup from '../components/StudentLookup';
import ClassLookupCascade from '../components/ClassLookupCascade';
import FacultyAssignmentAdder from '../components/FacultyAssignmentAdder';

const styles = {
  container: { maxWidth: '960px', margin: '0 auto', padding: '20px' },
  header: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#333', textAlign: 'center' },
  section: { marginBottom: '40px', backgroundColor: '#ffffff', padding: '20px',
    borderRadius: '8px', boxShadow: '0 0 8px rgba(0,0,0,0.1)', width: '100%' }
};

const steps = ['Lookup Student', 'Select Class', 'Create Assignment'];

export default function FacultyQuickAssign() {
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

  const hasRemainingHours = sessionHours && (
    sessionHours.remainingA > 0 || sessionHours.remainingB > 0 || sessionHours.remainingC > 0
  );

  const activeStep = studentData && hasRemainingHours && classDetails ? 2
    : studentData && hasRemainingHours ? 1
    : 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Faculty Quick Assign - Grader Only</h2>
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: '8px' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      <div style={styles.section}>
        <StudentLookup key={`student-${formResetKey}`} setStudentData={setStudentData} setSessionHours={setSessionHours} />
      </div>
      <div style={styles.section}>
        <ClassLookupCascade key={`class-${formResetKey}`} setClassDetails={setClassDetails} />
      </div>
      {studentData && hasRemainingHours && (
        <div style={styles.section}>
          <FacultyAssignmentAdder studentData={studentData} classDetails={classDetails || {}} sessionHours={sessionHours} onReset={onReset} />
        </div>
      )}
    </div>
  );
}
