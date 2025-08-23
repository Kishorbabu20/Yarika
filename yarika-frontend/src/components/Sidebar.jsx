import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Grid2X2,
  FolderOpen,
  Users,
  LogOut,
  UserCircle,
  XCircle
} from "lucide-react";
import "../styles/AdminDashboard.css";
import YarikaLogo from "../assets/YarikaLogo1.png";

const menuItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Grid2X2 },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Products", href: "/admin/products", icon: FolderOpen },
  { title: "Manage Master", href: "/admin/manage-master", icon: FolderOpen },
  { title: "Members", href: "/admin/members", icon: Users },
];

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <img
          src="/YarikaLogo1.png"
          alt="Yarika Logo"
          className="sidebar-logo"
          style={{ height: 36, width: 'auto', maxWidth: 120, objectFit: 'contain', background: 'none' }}
        />
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
              <span>{title}</span>
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
          <span>Logout</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
