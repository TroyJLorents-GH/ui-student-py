import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './AuthContext';
import { ProtectedRoute, AdminRoute } from './RouteGuard';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import QuickAssign from './pages/QuickAssign';
import FacultyQuickAssign from './pages/FacultyQuickAssign';
import ApplicationList from './pages/ApplicationList';
import Login from './pages/Login';
import MasterDashboard from './pages/MasterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BulkUploadAssignments from './pages/BulkUploadAssignments';
import ManageStudentAssignments from './pages/ManageStudentAssignments';
import StudentSummaryPage from "./pages/StudentSummaryPage";
import StudentAssignmentDashboard from './pages/StudentAssignmentDashboard';
import ProgramChairUploads from './pages/ProgramChairUploads';
import FacultyGraderUploads from './pages/FacultyGraderUploads';
import NotAuthorized from './NotAuthorized';
import ApiPing from './pages/ApiPing';

// Admin pages
import AdminHome from './admin/AdminHome';
import UsersTable from './admin/UsersTable';
import AddUser from './admin/AddUser';
import AuditLogs from './admin/AuditLogs';

import { LicenseInfo } from '@mui/x-license';
LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_LICENSE_KEY);


function App() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 60 : 250;

  return (
    <AuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

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
            <Route path="/login" element={<Login />} />
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="/api-test" element={<ApiPing />} />

            {/* Protected routes with permission checks */}
            <Route path="/quick-assign" element={
              <ProtectedRoute perm="assignment_adder"><QuickAssign /></ProtectedRoute>
            } />
            <Route path="/faculty-quick-assign" element={
              <ProtectedRoute perm="faculty_quickassign"><FacultyQuickAssign /></ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute perm="applications"><ApplicationList /></ProtectedRoute>
            } />
            <Route path="/student-summary" element={
              <ProtectedRoute perm="student_summary_page"><StudentSummaryPage /></ProtectedRoute>
            } />
            <Route path="/bulk-upload" element={
              <ProtectedRoute perm="bulk_upload_assignments"><BulkUploadAssignments /></ProtectedRoute>
            } />
            <Route path="/faculty-dashboard" element={
              <ProtectedRoute perm="faculty_dashboard"><StudentAssignmentDashboard /></ProtectedRoute>
            } />
            <Route path="/manage-assignments" element={
              <ProtectedRoute perm="manage_assignments"><ManageStudentAssignments /></ProtectedRoute>
            } />
            <Route path="/program-chair-uploads" element={
              <ProtectedRoute perm="program_chair_uploads"><ProgramChairUploads /></ProtectedRoute>
            } />
            <Route path="/faculty-grader-uploads" element={
              <ProtectedRoute perm="faculty_grader_uploads"><FacultyGraderUploads /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute perm="master_dashboard"><MasterDashboard /></ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UsersTable /></AdminRoute>} />
            <Route path="/admin/users/new" element={<AdminRoute><AddUser /></AdminRoute>} />
            <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
          </Routes>

          <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Developer Troy Lorents
          </footer>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
