import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LogIn,
  LogOut,
  Upload,
  LayoutDashboard,
  FileUser,
  Zap,
  Users,
  ClipboardList,
  Shield,
  GraduationCap,
  FolderUp,
  UserPlus
} from "lucide-react";
import { useAuth } from '../AuthContext';

export default function Navbar({ collapsed, setCollapsed }) {
  const { asurite, isAdmin, perms, logout } = useAuth();
  const sidebarWidth = collapsed ? 60 : 250;

  const hasPerm = (flag) => isAdmin || perms[flag];

  return (
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
      borderRight: '6px solid rgb(250, 243, 224)'
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

      {/* User info */}
      {!collapsed && asurite && (
        <div style={{ padding: '0 18px 12px', fontSize: 13, opacity: 0.8, borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 8 }}>
          Logged in as <b>{asurite}</b>
        </div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <NavItem to="/" icon={<Home size={22} />} label="Home" collapsed={collapsed} end />

          {hasPerm('assignment_adder') && (
            <NavItem to="/quick-assign" icon={<Zap size={22} />} label="Quick Assign" collapsed={collapsed} />
          )}

          {hasPerm('faculty_quickassign') && (
            <NavItem to="/faculty-quick-assign" icon={<UserPlus size={22} />} label="Grader Quick Assign" collapsed={collapsed} />
          )}

          {hasPerm('applications') && (
            <NavItem to="/applications" icon={<ClipboardList size={22} />} label="Applications" collapsed={collapsed} />
          )}

          {hasPerm('student_summary_page') && (
            <NavItem to="/student-summary" icon={<FileUser size={22} />} label="Student Summary" collapsed={collapsed} />
          )}

          {hasPerm('bulk_upload_assignments') && (
            <NavItem to="/bulk-upload" icon={<Upload size={22} />} label="Bulk Upload" collapsed={collapsed} />
          )}

          {hasPerm('faculty_dashboard') && (
            <NavItem to="/faculty-dashboard" icon={<LayoutDashboard size={22} />} label="Faculty Dashboard" collapsed={collapsed} />
          )}

          {hasPerm('manage_assignments') && (
            <NavItem to="/manage-assignments" icon={<Users size={22} />} label="Manage Assignments" collapsed={collapsed} />
          )}

          {hasPerm('program_chair_uploads') && (
            <NavItem to="/program-chair-uploads" icon={<FolderUp size={22} />} label="My Uploads" collapsed={collapsed} />
          )}

          {hasPerm('faculty_grader_uploads') && (
            <NavItem to="/faculty-grader-uploads" icon={<GraduationCap size={22} />} label="Grader Uploads" collapsed={collapsed} />
          )}

          {hasPerm('master_dashboard') && (
            <NavItem to="/dashboard" icon={<LayoutDashboard size={22} />} label="Master Dashboard" collapsed={collapsed} />
          )}

          {isAdmin && (
            <>
              {!collapsed && (
                <li style={{ padding: '12px 18px 4px', fontSize: 11, textTransform: 'uppercase', opacity: 0.5, letterSpacing: 1 }}>
                  Admin
                </li>
              )}
              <NavItem to="/admin-dashboard" icon={<Shield size={22} />} label="Admin Dashboard" collapsed={collapsed} />
              <NavItem to="/admin" icon={<Shield size={22} />} label="Admin Panel" collapsed={collapsed} />
            </>
          )}

          {!asurite ? (
            <NavItem to="/login" icon={<LogIn size={22} />} label="Login" collapsed={collapsed} />
          ) : (
            <li>
              <button onClick={logout} style={{ ...linkBase(collapsed), background: "none", border: "none", width: '100%' }}>
                <LogOut size={22} />
                {!collapsed && <span>Logout</span>}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, collapsed, end }) {
  return (
    <li>
      <NavLink to={to} end={end} style={({ isActive }) => linkStyle(collapsed, isActive)}>
        {icon}
        {!collapsed && <span>{label}</span>}
      </NavLink>
    </li>
  );
}

function linkBase(collapsed) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 18px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: 16,
    transition: "background 0.1s, color 0.1s",
    border: "none",
    cursor: "pointer",
    justifyContent: collapsed ? "center" : "flex-start"
  };
}

function linkStyle(collapsed, isActive) {
  const base = linkBase(collapsed);
  return {
    ...base,
    color: isActive ? "#e2b82c" : "#fff",
    background: isActive ? "#15396e" : "none",
    fontWeight: isActive ? 900 : "bold"
  };
}
