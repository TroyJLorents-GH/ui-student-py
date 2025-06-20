import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

import StudentLookup from './StudentLookup';
import ClassLookupCascade from './ClassLookupCascade';
import AssignmentAdder from './AssignmentAdder';
import ApplicationList from './ApplicationList';
import Login from './Login';
import MasterDashboard from './MasterDashboard';
import BulkUploadAssignments from './BulkUploadAssignments';

function App() {
  const [studentData, setStudentData] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [isAuthenticated, setAuth] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setStudentData(null);
      setClassDetails(null);
      setFormResetKey(prev => prev + 1);
    }
  }, [location]);

  const handleLogin = () => setAuth(true);
  const handleLogout = () => setAuth(false);

  const onReset = () => {
    setStudentData(null);
    setClassDetails(null);
    setFormResetKey(prev => prev + 1);
  };

  return (
    <>
      <nav style={navStyles.navbar}>
        <ul style={navStyles.navList}>
          <li><Link to="/" style={navStyles.navLink}>Home</Link></li>
          <li><Link to="/applications" style={navStyles.navLink}>Applications</Link></li>
          <li><Link to="/bulk-upload" style={navStyles.navLink}>Bulk Upload</Link></li>
          {!isAuthenticated ? (
            <li><Link to="/login" style={navStyles.navLink}>Login</Link></li>
          ) : (
            <>
              <li><Link to="/dashboard" style={navStyles.navLink}>Dashboard</Link></li>
              <li>
                <button onClick={handleLogout} style={navStyles.logoutBtn}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div style={pageStyles.container}>
        <Routes>
          <Route
            path="/"
            element={
              <div style={homeStyles.container}>
                <h2 style={homeStyles.header}>Student Assignment Management</h2>

                <div style={homeStyles.section}>
                  <StudentLookup
                    key={`student-${formResetKey}`}
                    setStudentData={setStudentData}
                  />
                </div>

                <div style={homeStyles.section}>
                  <ClassLookupCascade
                    key={`class-${formResetKey}`}
                    setClassDetails={setClassDetails}
                  />
                </div>

                {studentData && (
                  <div style={homeStyles.section}>
                    <AssignmentAdder
                      studentData={studentData}
                      classDetails={classDetails || {}}
                      onReset={onReset}
                    />
                  </div>
                )}
              </div>
            }
          />
          <Route path="/applications" element={<ApplicationList />} />
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to="/dashboard" replace />
                : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated
                ? <MasterDashboard />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/bulk-upload"
            element={
               <BulkUploadAssignments />
            }
          />
        </Routes>
      </div>
    </>
  );
}

const navStyles = {
  navbar: {
    backgroundColor: '#8c1d40',
    padding: '10px 20px',
    borderBottom: '10px solid #ffba05'
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    margin: 0,
    padding: 0,
    gap: '15px'
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: 0
  }
};

const pageStyles = {
  container: {
    padding: '20px',
    backgroundColor: '#f7f7f7',
    minHeight: '100vh'
  }
};

const homeStyles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '20px'
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333',
    textAlign: 'center'
  },
  section: {
    marginBottom: '40px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    width: '100%'
  }
};

export default App;

