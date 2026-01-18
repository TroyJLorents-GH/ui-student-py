import React, { useState, useEffect } from 'react';
import StudentLookup from '../components/StudentLookup';
import ClassLookupCascade from '../components/ClassLookupCascade';
import AssignmentAdder from '../components/AssignmentAdder';

const styles = {
  container: { maxWidth: '960px', margin: '0 auto', padding: '20px' },
  header: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#333', textAlign: 'center' },
  section: {
    marginBottom: '40px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    width: '100%'
  }
};

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

  // Check if student has remaining hours (supports both simple and session-based hours)
  const hasRemainingHours = sessionHours && (
    // Session-based hours
    (sessionHours.remainingA !== undefined && (sessionHours.remainingA > 0 || sessionHours.remainingB > 0 || sessionHours.remainingC > 0)) ||
    // Simple remaining hours (fallback)
    (sessionHours.remaining !== undefined && sessionHours.remaining > 0) ||
    // Legacy total-based check
    (typeof sessionHours === 'number' && sessionHours < 20)
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Quick Assign</h2>
      <div style={styles.section}>
        <StudentLookup
          key={`student-${formResetKey}`}
          setStudentData={setStudentData}
          setSessionHours={setSessionHours}
        />
      </div>
      <div style={styles.section}>
        <ClassLookupCascade key={`class-${formResetKey}`} setClassDetails={setClassDetails} />
      </div>
      {studentData && (hasRemainingHours || hasRemainingHours === null) && (
        <div style={styles.section}>
          <AssignmentAdder
            studentData={studentData}
            classDetails={classDetails || {}}
            sessionHours={sessionHours}
            onReset={onReset}
          />
        </div>
      )}
    </div>
  );
}
