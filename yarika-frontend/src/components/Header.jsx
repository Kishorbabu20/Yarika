// src/components/Header.jsx
import React from "react";
import "../styles/AdminDashboard.css";

const Header = () => {
  return (
    <div
      className="header"
      style={{
        padding: 0,
        margin: 0,
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
      }}
    >
      <input
        className="search"
        type="text"
        placeholder="Search..."
        style={{
          padding: '10px 36px 10px 36px',
          borderRadius: 24,
          border: '1px solid #e5e5e5',
          background: '#faf9f6',
          fontSize: 16,
          width: 200,
          height: 40,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%' }}>
        <span style={{ color: '#b19049', fontSize: 22, marginRight: 8, cursor: 'pointer' }}>🔔</span>
        <span style={{ background: '#c6aa62', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, cursor: 'pointer' }}>👤</span>
      </div>
    </div>
  );
};

export default Header;
