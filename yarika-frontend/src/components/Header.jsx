// src/components/Header.jsx
import { useEffect, useState, useRef } from "react";
import api from "../config/axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import { Bell, User } from "lucide-react";

const Header = ({ title }) => {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const seenNotificationsRef = useRef(new Set());
  const navigate = useNavigate();

  // Load seen notifications from localStorage on component mount
  useEffect(() => {
    const savedSeen = localStorage.getItem('seenNotifications');
    if (savedSeen) {
      seenNotificationsRef.current = new Set(JSON.parse(savedSeen));
    }
  }, []);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/orders/recent");
        // Filter out notifications that have been seen
        const newNotifications = res.data.filter(order => !seenNotificationsRef.current.has(order._id));
        setNotifications(newNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (orderId) => {
    // Mark as seen by adding to seenNotifications set
    seenNotificationsRef.current.add(orderId);
    
    // Save to localStorage
    localStorage.setItem('seenNotifications', JSON.stringify([...seenNotificationsRef.current]));
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n._id !== orderId));
    setDropdownOpen(false);
    
    // Navigate to order details page
    navigate(`/admin/orders/${orderId}`);
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  return (
    <div
      className="header"
      style={{
        padding: 0,
        margin: 0,
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
      }}
    >
      <div style={{ flex: 2, textAlign: 'left', paddingLeft: 40 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#181818', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%' }}>
        <div style={{ position: "relative" }}>
          <Bell
            size={24}
            color="#b19049"
            style={{ marginRight: 8, cursor: "pointer" }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
          {dropdownOpen && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <div className="notification-empty">No new orders</div>
              ) : (
                notifications.map(order => (
                  <div
                    key={order._id}
                    className="notification-item"
                    onClick={() => handleNotificationClick(order._id)}
                  >
                    New order: #{order._id.slice(-6).toUpperCase()}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <span 
          onClick={handleProfileClick}
          style={{ 
            background: '#c6aa62', 
            borderRadius: '50%', 
            width: 36, 
            height: 36, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontSize: 20, 
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            ':hover': {
              transform: 'scale(1.1)'
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <User size={20} color="#442266" />
        </span>
      </div>
    </div>
  );
};

export default Header;
