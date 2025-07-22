import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { AiOutlineEye } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import toast from "react-hot-toast";
import "./AdminLogin.css";

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/admins/login", {
        username: identifier, // Send as username for backend compatibility
        password
      });
      
      const { role } = response.data;
      
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminRole", role);
      localStorage.setItem("adminName", response.data.name);
      localStorage.setItem("adminEmail", response.data.email);
      localStorage.setItem("adminUsername", response.data.username);
      
      toast.success(`${role} login successful!`);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="admin-login-bg">
      <form className="admin-login-box" onSubmit={handleSubmit}>
        <h1 className="admin-login-logo">YARIKA</h1>
        <p className="admin-login-tagline">--EXPRESS YOURSELF--</p>
        <h2 className="admin-login-title">Admin Portal</h2>
        <p className="admin-login-subtitle">Login as Admin or Super Admin</p>
        <div className="admin-login-input-group">
          <FaUser className="icon" />
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="admin-login-input-group">
          <FaLock className="icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <AiOutlineEye 
            className="admin-login-eye-icon" 
            onClick={() => setShowPassword(!showPassword)} 
          />
        </div>
        <button type="submit" className="admin-login-btn">Login</button>
        {message && (
          <p className="admin-login-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
