import React from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  BarChart3,
  Package,
  Settings,
  Users
} from "lucide-react";
import "../styles/AdminDashboard.css";
import YarikaLogo from "../assets/YarikaLogo1.png";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <img
          src={YarikaLogo}
          alt="Yarika Logo"
          className="sidebar-logo"
          style={{ height: 36, width: 'auto', maxWidth: 120, objectFit: 'contain', background: 'none' }}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={18} className="icon" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <BarChart3 size={18} className="icon" />
          <span>Analytics</span>
        </NavLink>
        
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <Package size={18} className="icon" />
          <span>Products</span>
        </NavLink>
        
        <NavLink
          to="/admin/manage-master"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={18} className="icon" />
          <span>Manage Master</span>
        </NavLink>
        
        <NavLink
          to="/admin/members"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <Users size={18} className="icon" />
          <span>Members</span>
        </NavLink>
      </nav>

      {/* Logout Section */}
      <div className="logout-section">
        <NavLink
          to="/admin/logout"
          className={({ isActive }) =>
            `nav-link logout-link ${isActive ? "active" : ""}`
          }
        >
          <LogOut size={18} className="icon" />
          <span>Logout</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
