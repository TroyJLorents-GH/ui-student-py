import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>Home</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/assignments" style={styles.navLink}>Assignments</Link>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#007bff',
    padding: '10px 20px'
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    margin: 0,
    padding: 0
  },
  navItem: {
    marginRight: '20px'
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default NavigationBar;
