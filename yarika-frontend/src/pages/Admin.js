import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminAnalytics from "../pages/AdminAnalytics";
import Products from "../pages/Products"
import Logout from "../Logout";
import Members from "../pages/Members";
import ProtectedRoute from "../utils/ProtectedRoute";


function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  const onLogin = (role) => setRole(role);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" />} />
        <Route path="/admin" element={<AdminLogin onLogin={onLogin} />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
