// src/components/StatCard.jsx
import React from "react";
import "../styles/AdminDashboard.css";

const StatCard = ({ title, value, change, type = "default" }) => (
  <div className="stat-card">
    <h4 className="stat-title">{title}</h4>
    <p className="stat-value">{value}</p>
    {change && <p className={`stat-change ${type}`}>{change}</p>}
  </div>
);

export default StatCard;
