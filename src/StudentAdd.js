import React, { useState } from 'react';

const StudentAdd = () => {
  // State to toggle form visibility
  const [showForm, setShowForm] = useState(false);

  // Initial state for a new student record
  const [student, setStudent] = useState({
    student_ID: '',
    first_Name: '',
    last_Name: '',
    email: '',
    education_Level: '',
    position: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handler to update fields
  const handleChange = (field, value) => {
    setStudent(prev => ({ ...prev, [field]: value }));
  };

  // Handler to add a new student
  const handleAddStudent = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('https://localhost:7209/api/Student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(student)
      });
      if (!response.ok) {
        throw new Error('Failed to add student');
      }
      // We don't need to use the returned JSON data here.
      setSuccess('Student added successfully!');
      // Optionally clear the form after successful submission.
      setStudent({
        student_ID: '',
        first_Name: '',
        last_Name: '',
        email: '',
        education_Level: '',
        position: ''
      });
      // Hide the form after a successful add (optional)
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Add Student</h1>
      {/* If the form is not visible, show the "Add Student" button */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={styles.button}>
          Add Student
        </button>
      ) : (
        <div>
          {error && <p style={styles.error}>Error: {error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <div style={styles.field}>
            <label style={styles.label}>Student ID:</label>
            <input
              type="text"
              value={student.student_ID}
              onChange={(e) => handleChange('student_ID', e.target.value)}
              style={styles.input}
              placeholder="Enter Student ID"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>First Name:</label>
            <input
              type="text"
              value={student.first_Name}
              onChange={(e) => handleChange('first_Name', e.target.value)}
              style={styles.input}
              placeholder="Enter First Name"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Last Name:</label>
            <input
              type="text"
              value={student.last_Name}
              onChange={(e) => handleChange('last_Name', e.target.value)}
              style={styles.input}
              placeholder="Enter Last Name"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={student.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={styles.input}
              placeholder="Enter Email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Education Level:</label>
            <input
              type="text"
              value={student.education_Level}
              onChange={(e) => handleChange('education_Level', e.target.value)}
              style={styles.input}
              placeholder="Enter Education Level"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Position:</label>
            <input
              type="text"
              value={student.position}
              onChange={(e) => handleChange('position', e.target.value)}
              style={styles.input}
              placeholder="Enter Position"
            />
          </div>
          <button onClick={handleAddStudent} style={styles.button}>
            Submit Student
          </button>
          <button onClick={() => setShowForm(false)} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  field: {
    marginBottom: '10px'
  },
  label: {
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '5px'
  },
  input: {
    padding: '8px',
    width: '300px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    marginRight: '10px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  error: {
    color: 'red'
  },
  success: {
    color: 'green'
  }
};

export default StudentAdd;
