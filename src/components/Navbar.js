import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Home,
  LogIn,
  LogOut,
  Upload,
  LayoutDashboard,
  FileUser,
  Zap
} from "lucide-react";

export default function Navbar({ collapsed, setCollapsed, isAuthenticated, handleLogout }) {
  const sidebarWidth = collapsed ? 60 : 250;

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

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <NavLink to="/" end style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <Home size={22} />
              {!collapsed && <span>Home</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/quick-assign" style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <Zap size={22} />
              {!collapsed && <span>Quick Assign</span>}
            </NavLink>
          </li>
          {/* <li>
            <NavLink to="/manage-assignments" style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <Users size={22} />
              {!collapsed && <span>Manage Student Assignments</span>}
            </NavLink>
          </li> */}
          <li>
            <NavLink to="/applications" style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <Menu size={22} />
              {!collapsed && <span>Applications</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/student-summary" style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <FileUser size={22} />
              {!collapsed && <span>Student Summary</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/bulk-upload" style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <Upload size={22} />
              {!collapsed && <span>Bulk Upload</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/faculty-dashboard" style={({ isActive }) => linkStyle(collapsed, isActive)}>
              <LayoutDashboard size={22} />
              {!collapsed && <span>Student Assignment Dashboard</span>}
            </NavLink>
          </li>
          {!isAuthenticated ? (
            <li>
              <NavLink to="/login" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                <LogIn size={22} />
                {!collapsed && <span>Login</span>}
              </NavLink>
            </li>
          ) : (
            <>
              <li>
                <NavLink to="/dashboard" style={({ isActive }) => linkStyle(collapsed, isActive)}>
                  <LayoutDashboard size={22} />
                  {!collapsed && <span>Master Dashboard</span>}
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} style={{ ...linkBase(collapsed), background: "none", border: "none" }}>
                  <LogOut size={22} />
                  {!collapsed && <span>Logout</span>}
                </button>
              </li>
            </>
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
    color: isActive ? "#e2b82c" : "#fff",
    background: isActive ? "#15396e" : "none",
    fontWeight: isActive ? 900 : "bold"
  };
}
