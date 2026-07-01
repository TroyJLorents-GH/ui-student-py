import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Users,
  LogIn,
  LogOut,
  Upload,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from '../AuthContext';

export default function Navbar({ collapsed, setCollapsed }) {
  const { asurite, isAdmin, perms, login, logout } = useAuth();
  const sidebarWidth = collapsed ? 60 : 250;

  // NEW: collapsible Admin section
  const [adminOpen, setAdminOpen] = useState(true);

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
      overflowY: 'auto'
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
            <NavLink to="/" end style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <Home size={22} />
              {!collapsed && <span>Home</span>}
            </NavLink>
          </li>

          {(perms?.assignment_adder || isAdmin) && (
            <li>
              <NavLink to="/quick-assign" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span>Quick Assign</span>}
              </NavLink>
            </li>
          )}

          {(perms?.faculty_quickassign || isAdmin) && (
            <li>
              <NavLink to="/faculty-quick-assign" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span>Faculty Grader Assign</span>}
              </NavLink>
            </li>
          )}

          {/* {(perms?.manage_assignments || isAdmin) && (
            <li>
              <NavLink to="/manage-assignments" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <Users size={22} />
                {!collapsed && <span>Manage Student Assignments</span>}
              </NavLink>
            </li>
          )} */}

          {(perms?.applications || isAdmin) && (
            <li>
              <NavLink to="/applications" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <Menu size={22} />
                {!collapsed && <span>Masters & PhD Applications</span>}
              </NavLink>
            </li>
          )}

          {/* {(perms?.phd_applications || isAdmin) && (
            <li>
              <NavLink to="/phd-applications" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <Menu size={22} />
                {!collapsed && <span>PhD Applications</span>}
              </NavLink>
            </li>
          )} */}

          {(perms?.student_summary_page || isAdmin) && (
            <li>
              <NavLink to="/student-summary" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <Menu size={22} />
                {!collapsed && <span>Edit Student Assignment</span>}
              </NavLink>
            </li>
          )}

          {(perms?.bulk_upload_assignments || isAdmin) && (
            <li>
              <NavLink to="/bulk-upload" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <Upload size={22} />
                {!collapsed && <span>Bulk Upload</span>}
              </NavLink>
            </li>
          )}

          {(perms?.faculty_dashboard || isAdmin) && (
            <li>
              <NavLink to="/faculty-dashboard" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span>Student Assignment Dashboard</span>}
              </NavLink>
            </li>
          )}

          {(perms?.master_dashboard || isAdmin) && (
            <li>
              <NavLink to="/dashboard" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span> HR Master Dashboard</span>}
              </NavLink>
            </li>
          )}

          {(perms?.program_chair_uploads || isAdmin) && (
            <li>
              <NavLink to="/program-chair-uploads" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span>Program Chair Dashboard</span>}
              </NavLink>
            </li>
          )}

          {(perms?.faculty_grader_uploads || isAdmin) && (
            <li>
              <NavLink to="/faculty-grader-uploads" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span>Faculty Grader Dashboard</span>}
              </NavLink>
            </li>
          )}

          {(perms?.analytics || isAdmin) && (
            <li>
              <NavLink to="/analytics" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LayoutDashboard size={22} />
                {!collapsed && <span>Analytics</span>}
              </NavLink>
            </li>
          )}

          {isAdmin && (
            <>
              {/* Admin header row with chevron */}
              <li
                style={{
                  padding: collapsed ? "6px 0" : "10px 12px",
                  fontSize: 12,
                  opacity: 0.9,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                {/* When collapsed, show just the icon and make the whole row clickable */}
                <button
                  onClick={() => setAdminOpen((o) => !o)}
                  aria-expanded={adminOpen}
                  aria-controls="admin-submenu"
                  style={{
                    ...linkBase(collapsed),
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: collapsed ? "8px 0" : "8px 6px",
                    justifyContent: collapsed ? "center" : "space-between",
                    fontSize: 12
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LayoutDashboard size={18} />
                    {!collapsed && <span>ADMIN</span>}
                  </span>
                  {!collapsed && (adminOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </button>
              </li>

              {/* Submenu (hidden when collapsed or when adminOpen = false) */}
              {!collapsed && adminOpen && (
                <>
                  <li>
                    <NavLink to="/admin" end style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <LayoutDashboard size={20} />
                      <span>Admin Home</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/admin-dashboard" style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <LayoutDashboard size={20} />
                      <span>Admin Dashboard</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/admin/users" style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <Users size={20} />
                      <span>Manage Users</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/admin/users/new" style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <Menu size={20} />
                      <span>Add User</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/admin/maintenance" style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <Menu size={20} />
                      <span>Maintenance</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/admin/audit-logs" style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <Menu size={20} />
                      <span>Audit Logs</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/admin/analytics" style={({ isActive }) => subLinkStyle(collapsed, isActive)}>
                      <LayoutDashboard size={20} />
                      <span>Analytics (Admin)</span>
                    </NavLink>
                  </li>
                </>
              )}
            </>
          )}

          {!asurite ? (
            <li>
              <button onClick={login} style={{ ...linkBase(collapsed), background: "none", border: "none" }}>
                <LogIn size={22} />
                {!collapsed && <span>Login</span>}
              </button>
            </li>
          ) : (
            <li>
              <button onClick={logout} style={{ ...linkBase(collapsed), background: "none", border: "none" }}>
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
    color: "#fff",
    background: isActive ? "#15396e" : "none",
    fontWeight: isActive ? 900 : "bold"
  };
}

// Indented style for submenu items
function subLinkStyle(collapsed, isActive) {
  const base = linkBase(collapsed);
  return {
    ...base,
    padding: "12px 18px 12px 34px",     // extra left indent
    fontSize: 15,
    color: "#fff",
    background: isActive ? "#15396e" : "none",
    fontWeight: isActive ? 900 : "bold"
  };
}
