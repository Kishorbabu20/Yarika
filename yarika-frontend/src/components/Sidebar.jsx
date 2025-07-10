import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Grid2X2,
  FolderOpen,
  Users,
  LogOut,
  Menu,
  X,
  UserCircle
} from "lucide-react";
import "../styles/AdminDashboard.css";
import YarikaLogo from "../Img/Yarika Logo (1).png";

const menuItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Grid2X2 },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Products", href: "/admin/products", icon: FolderOpen },
  { title: "Members", href: "/admin/members", icon: Users },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <img
            src={YarikaLogo}
            alt="Yarika Logo"
            className="sidebar-logo"
            style={{ height: 36, width: 'auto', maxWidth: 120, objectFit: 'contain' }}
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="toggle-btn"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <ul className="menu">
        {menuItems.map(({ title, href, icon: Icon }) => (
          <li key={href}>
            <NavLink
              to={href}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} className="icon" />
              {!collapsed && <span>{title}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="logout-section">
        <NavLink
          to="/admin/logout"
          className={({ isActive }) =>
            `nav-link logout-link ${isActive ? "active" : ""}`
          }
        >
          <LogOut size={18} className="icon" />
          {!collapsed && <span>Logout</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
