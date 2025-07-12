import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";

const ChangePasswordModal = ({ isOpen, onRequestClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePwdMsg, setChangePwdMsg] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePwdMsg("");
    if (newPassword !== confirmPassword) {
      setChangePwdMsg("New passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://yarika.in/api/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChangePwdMsg("Password changed successfully!");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => onRequestClose(), 1200);
    } catch (err) {
      setChangePwdMsg(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Change Password"
      ariaHideApp={false}
      style={{ overlay: { zIndex: 1000, background: 'rgba(0,0,0,0.3)' }, content: { maxWidth: 400, margin: 'auto', borderRadius: 12, padding: 32 } }}
    >
      <h2 style={{ marginBottom: 16 }}>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <div style={{ marginBottom: 12 }}>
          <label>Old Password</label>
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        {changePwdMsg && <div style={{ color: changePwdMsg.includes('success') ? 'green' : 'red', marginBottom: 8 }}>{changePwdMsg}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onRequestClose} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#eee', color: '#333', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#c6aa62', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Change</button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal; 