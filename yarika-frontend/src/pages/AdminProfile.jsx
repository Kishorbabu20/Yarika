import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import api from "../config/axios";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get admin details from localStorage
  const adminName = localStorage.getItem("adminName") || "Admin";
  const adminEmail = localStorage.getItem("adminEmail") || "";
  const adminRole = localStorage.getItem("adminRole") || "Admin";
  
  // Get first letter for avatar, with fallback
  const avatarLetter = adminName && adminName.length > 0 ? adminName.charAt(0).toUpperCase() : "A";

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/admin/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Password change failed:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
    toast.success("Logged out successfully!");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '600', 
              color: '#222',
              margin: '0 0 16px 0'
            }}>
              {adminName}'s Profile
            </h1>
            <hr style={{ 
              margin: '0', 
              border: 'none', 
              borderTop: '1px solid #e5e5e5' 
            }} />
          </div>

          {/* Profile Section */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px',
            marginBottom: '48px'
          }}>
            {/* Profile Picture */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#c6aa62',
                border: '2px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                {avatarLetter}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '24px',
                height: '24px',
                backgroundColor: '#222',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '12px', color: '#fff' }}>✏️</span>
              </div>
            </div>
            
            {/* Admin Name */}
            <div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#222',
                margin: '0 0 4px 0'
              }}>
                {adminName}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#666',
                margin: '0 0 2px 0'
              }}>
                {adminEmail}
              </p>
              <span style={{ 
                fontSize: '12px', 
                color: '#c6aa62',
                fontWeight: '500',
                backgroundColor: '#f8f6f0',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {adminRole}
              </span>
            </div>
          </div>

          {/* Password Change Form */}
          <div style={{ 
            maxWidth: '500px',
            marginBottom: '48px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#222',
              margin: '0 0 24px 0'
            }}>
              Change Password
            </h3>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <Label>Current Password *</Label>
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <Label>New Password *</Label>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <Label>Confirm Password *</Label>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>
              
              <Button 
                type="submit" 
                className="gold-btn"
                disabled={isSubmitting}
                style={{ 
                  backgroundColor: '#c6aa62',
                  color: '#222',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </div>

          {/* Logout Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: '48px'
          }}>
            <Button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                color: '#dc2626',
                border: '2px solid #dc2626',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '14px' }}>→</span>
              Logout
            </Button>
          </div>
        </div>
      </div>
  );
};

export default AdminProfile; 