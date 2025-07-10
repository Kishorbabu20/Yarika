import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  const onLogin = (role) => setRole(role);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={role ? `/${role}` : "/login"} />} />
        <Route path="/login" element={<AdminLogin onLogin={onLogin} />} />
        <Route path="/admin" element={role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/analytics" element={role === "admin" ? <AdminAnalytics /> : <Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
}

export default App;