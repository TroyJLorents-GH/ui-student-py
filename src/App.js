import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import QuickAssign from './pages/QuickAssign';
import ApplicationList from './pages/ApplicationList';
import Login from './pages/Login';
import MasterDashboard from './pages/MasterDashboard';
import BulkUploadAssignments from './pages/BulkUploadAssignments';
import ManageStudentAssignments from './pages/ManageStudentAssignments';
import StudentSummaryPage from "./pages/StudentSummaryPage";
import StudentAssignmentDashboard from './pages/StudentAssignmentDashboard';

import { LicenseInfo } from '@mui/x-license';
LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_LICENSE_KEY);


function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogin = () => setAuth(true);
  const handleLogout = () => setAuth(false);

  const sidebarWidth = collapsed ? 60 : 250;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Navbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
      />

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
          <Route path="/" element={<Home />} />
          <Route path="/quick-assign" element={<QuickAssign />} />
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
          <Route path="/faculty-dashboard" element={<StudentAssignmentDashboard />} />
        </Routes>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
          Developer Troy Lorents
        </footer>
      </div>
    </div>
  );
}

export default App;
