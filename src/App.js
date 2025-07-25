import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

// Optionally install lucide-react or use emoji/icons of your choice
import { Menu, ChevronLeft, ChevronRight, Home, Users, LogIn, LogOut, Upload, LayoutDashboard, FileUser  } from "lucide-react";

import StudentLookup from './components/StudentLookup';
import ClassLookupCascade from './components/ClassLookupCascade';
import AssignmentAdder from './components/AssignmentAdder';
import ApplicationList from './pages/ApplicationList';
import Login from './pages/Login';
import MasterDashboard from './pages/MasterDashboard';
import BulkUploadAssignments from './pages/BulkUploadAssignments';
import ManageStudentAssignments from './pages/ManageStudentAssignments';
import StudentSummaryPage from "./pages/StudentSummaryPage";


import { LicenseInfo } from '@mui/x-license';
LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_LICENSE_KEY);


function App() {
  const [studentData, setStudentData] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [isAuthenticated, setAuth] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  // Sidebar width: collapsed (60px), expanded (220px)
  const sidebarWidth = collapsed ? 60 : 250;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarWidth,
        backgroundColor: '#1d498c',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 99,
        borderRight: '6px solidrgb(250, 243, 224)'
      }}>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: 16,
            alignSelf: collapsed ? 'center' : 'flex-end',
            fontSize: 22
          }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link to="/" style={linkStyle(collapsed)}>
                <Home size={22} />
                {!collapsed && <span>Home</span>}
              </Link>
            </li>
            <li>
              <Link to="/manage-assignments" style={linkStyle(collapsed)}>
                <Users size={22} />
                {!collapsed && <span>Manage Student Assignments</span>}
              </Link>
            </li>
            <li>
              <Link to="/applications" style={linkStyle(collapsed)}>
                <Menu size={22} />
                {!collapsed && <span>Applications</span>}
              </Link>
            </li>
            <li>
              <Link to="/student-summary" style={linkStyle(collapsed)}>
                <FileUser  size={22} />
                {!collapsed && <span>Student Summary</span>}
              </Link>
            </li>
            <li>
              <Link to="/bulk-upload" style={linkStyle(collapsed)}>
                <Upload size={22} />
                {!collapsed && <span>Bulk Upload</span>}
              </Link>
            </li>
            {!isAuthenticated ? (
              <li>
                <Link to="/login" style={linkStyle(collapsed)}>
                  <LogIn size={22} />
                  {!collapsed && <span>Login</span>}
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/dashboard" style={linkStyle(collapsed)}>
                    <LayoutDashboard size={22} />
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} style={{ ...linkStyle(collapsed), background: "none", border: "none" }}>
                    <LogOut size={22} />
                    {!collapsed && <span>Logout</span>}
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.2s',
        padding: 24,
        backgroundColor: '#f7f7f7',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route
            path="/"
            element={(
              <div style={homeStyles.container}>
                <h2 style={homeStyles.header}>Student Assignment Management</h2>
                <div style={homeStyles.section}>
                  <StudentLookup key={`student-${formResetKey}`} setStudentData={setStudentData} />
                </div>
                <div style={homeStyles.section}>
                  <ClassLookupCascade key={`class-${formResetKey}`} setClassDetails={setClassDetails} />
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
            )}
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
          <Route path="/bulk-upload" element={<BulkUploadAssignments />} />
          <Route path="/student-summary" element={<StudentSummaryPage />} />
          <Route path="/manage-assignments" element={<ManageStudentAssignments />} />
        </Routes>
         {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
        © 2025 Developer Troy Lorents
      </footer>
      </div>
    </div>
  );
}

// Sidebar link styles
function linkStyle(collapsed) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 18px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: 16,
    transition: "background 0.1s",
    border: "none",
    background: "none",
    cursor: "pointer",
    justifyContent: collapsed ? "center" : "flex-start"
  };
}

// Your existing homeStyles, etc.
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