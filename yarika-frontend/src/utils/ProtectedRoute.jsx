import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../config/axios";
import toast from "react-hot-toast";

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#faf9f6'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        // Make a request to a protected endpoint to validate token
        await api.get("/api/analytics/stats");
        setIsValid(true);
      } catch (err) {
        console.error("Token validation failed:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        // Clear invalid tokens
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminEmail");
        
        // Show appropriate error message
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          toast.error("You don't have permission to access this area.");
        } else {
          toast.error("Authentication failed. Please login again.");
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return <LoadingSpinner />;
  }

  return isValid ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
