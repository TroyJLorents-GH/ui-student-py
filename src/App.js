// src/App.js - Unified for DEV and PROD
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ApplicationList from "./pages/ApplicationList";
// import PhdApplicationList from './pages/PhdApplicationList';
import Login from "./pages/Login";
import MasterDashboard from "./pages/MasterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BulkUploadAssignments from "./pages/BulkUploadAssignments";
import ManageStudentAssignments from "./pages/ManageStudentAssignments";
import StudentSummaryPage from "./pages/StudentSummaryPage";
import StudentAssignmentDashboard from "./pages/StudentAssignmentDashboard";
import QuickAssign from "./pages/QuickAssign";
import FacultyQuickAssign from "./pages/FacultyQuickAssign";
import ProgramChairUploads from "./pages/ProgramChairUploads";
import FacultyGraderUploads from "./pages/FacultyGraderUploads";
import Home from "./pages/Home";

import AdminHome from "./admin/AdminHome";
import UsersTable from "./admin/UsersTable";
import AddUser from "./admin/AddUser";
import AuditLogs from "./admin/AuditLogs";
import AdminAnalytics from "./admin/AdminAnalytics";
import ChatWidget from "./components/ChatWidget";
import AdminMaintenance from "./pages/AdminMaintenance";
import NotAuthorized from "./NotAuthorized";
import ApiPing from "./pages/ApiPing";

import Navbar from "./components/Navbar";
import { ProtectedRoute, AdminRoute } from "./RouteGuard";
import { AuthProvider, useAuth } from "./AuthContext";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import { LicenseInfo } from "@mui/x-license";
LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_LICENSE_KEY);

console.log("REACT_APP_API_URL =", process.env.REACT_APP_API_URL);
console.log("REACT_APP_USE_CAS =", process.env.REACT_APP_USE_CAS);

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 60 : 250;
  const { asurite, isAdmin, perms, USE_CAS } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: "margin-left 0.2s",
          padding: 24,
          backgroundColor: "#FAFAFA",
          minHeight: "100vh",
        }}
      >
        <Routes>
          {/* Home route - protected in PROD (CAS), public in DEV */}
          <Route
            path="/"
            element={
              USE_CAS ? (
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              ) : (
                <Home />
              )
            }
          />

          {/* Protected + perm-gated */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                {perms?.applications || isAdmin ? (
                  <ApplicationList />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/phd-applications"
            element={
              <ProtectedRoute>
                {perms?.phd_applications || isAdmin ? <PhdApplicationList /> : <NotAuthorized />}
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/student-summary"
            element={
              <ProtectedRoute>
                {perms?.student_summary_page || isAdmin ? (
                  <StudentSummaryPage />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-assignments"
            element={
              <ProtectedRoute>
                {perms?.manage_assignments || isAdmin ? (
                  <ManageStudentAssignments />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk-upload"
            element={
              <ProtectedRoute>
                {perms?.bulk_upload_assignments || isAdmin ? (
                  <BulkUploadAssignments />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-dashboard"
            element={
              <ProtectedRoute>
                {perms?.faculty_dashboard || isAdmin ? (
                  <StudentAssignmentDashboard />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {perms?.master_dashboard || isAdmin ? (
                  <MasterDashboard />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />

          {/* Quick Assign (old Home tools) */}
          <Route
            path="/quick-assign"
            element={
              <ProtectedRoute>
                {perms?.assignment_adder || isAdmin ? (
                  <QuickAssign />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />

          {/* Faculty Quick Assign - Grader Only */}
          <Route
            path="/faculty-quick-assign"
            element={
              <ProtectedRoute>
                {perms?.faculty_quickassign || isAdmin ? (
                  <FacultyQuickAssign />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />

          {/* Program Chair Uploads */}
          <Route
            path="/program-chair-uploads"
            element={
              <ProtectedRoute>
                {perms?.program_chair_uploads || isAdmin ? (
                  <ProgramChairUploads />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />

          {/* Faculty Grader Uploads */}
          <Route
            path="/faculty-grader-uploads"
            element={
              <ProtectedRoute>
                {perms?.faculty_grader_uploads || isAdmin ? (
                  <FacultyGraderUploads />
                ) : (
                  <NotAuthorized />
                )}
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard - shows all assignments */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UsersTable />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <AdminRoute>
                <AddUser />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <AdminRoute>
                <AdminMaintenance />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AuditLogs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics adminView />
              </AdminRoute>
            }
          />
          {/* RBAC-gated manager view — toggle the `analytics` permission per user */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                {perms?.analytics || isAdmin ? <AdminAnalytics /> : <NotAuthorized />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={!asurite ? <Login /> : <Navigate to="/" replace />}
          />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/api-test" element={<ApiPing />} />
        </Routes>
        {/* SAMS Assistant chatbot — only for users with the `chat` RBAC permission (admins always) */}
        {asurite && (perms?.chat || isAdmin) && <ChatWidget />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
