import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Admin</h1>
      <p style={{ marginTop: 0, color: '#555' }}>
        Manage access control and system administration tools.
      </p>
      <ul style={{ lineHeight: 1.9 }}>
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/users/new">Add User</Link></li>
      </ul>
    </div>
  );
}
