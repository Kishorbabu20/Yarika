import { useNavigate } from "react-router-dom";
import { Button } from "./components/ui/Button";
import "./styles/NewMember.css";
import { useState } from "react";
import { useCart } from "./context/CartContext";

const Logout = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const { handleLogout } = useCart();

  const handleLogoutClick = async () => {
    // First clear cart and local storage
    handleLogout();
    
    // Then navigate
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          {/* Gold logout icon SVG */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 16V12C40 9.79086 38.2091 8 36 8H16C13.7909 8 12 9.79086 12 12V52C12 54.2091 13.7909 56 16 56H36C38.2091 56 40 54.2091 40 52V48" stroke="#c6aa62" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M52 32H28" stroke="#c6aa62" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M44 24L52 32L44 40" stroke="#c6aa62" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: '#181818' }}>Logout</h2>
        <p style={{ fontSize: 20, color: '#222', margin: '24px 0 32px 0', fontWeight: 400 }}>Are You Sure You Want To Logout?</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={handleCancel}>Cancel</Button>
          <Button style={{ flex: 1, background: '#c6aa62', color: '#fff', border: 'none' }} onClick={handleLogoutClick}>Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
