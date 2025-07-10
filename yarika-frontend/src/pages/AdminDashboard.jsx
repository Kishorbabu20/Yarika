import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import SalesChart from "../components/SalesChart";
import RevenuePie from "../components/RevenuePie";
import OrdersTable from "../components/OrdersTable";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import toast from "react-hot-toast";
import "../styles/AdminDashboard.css";
import { useQuery } from '@tanstack/react-query';
import Modal from "react-modal";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ ordersThisMonth: 0, activeProducts: 0, adminUsers: 0, ordersChange: "" });
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePwdMsg, setChangePwdMsg] = useState("");

  useEffect(() => {
    fetchStats();
    fetchSales();
    fetchRevenue();
    fetchOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/analytics/stats");
      setStats(res.data);
    } catch (err) {
      // fallback or error handling
    }
  };
  const fetchSales = async () => {
    try {
      const res = await api.get("/api/analytics/sales-chart");
      setSalesData(res.data);
    } catch (err) {
      console.error("Error fetching sales chart:", err);
      toast.error("Failed to load sales data");
      setSalesData([]); // Set empty array as fallback
    }
  };
  const fetchRevenue = async () => {
    try {
      const res = await api.get("/api/analytics/orders-per-day");
      setRevenueData(res.data);
    } catch (err) {
      console.error("Error fetching revenue chart:", err);
      toast.error("Failed to load revenue data");
      setRevenueData([]); // Set empty array as fallback
    }
  };
  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders/recent");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
      toast.error("Failed to load recent orders");
      setOrders([]); // Set empty array as fallback
    }
  };

  const fetchAllOrders = async () => {
    try {
      // Check for admin token first
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        console.error("No admin token found");
        toast.error("Please log in again");
        window.location.href = "/admin/login";
        return;
      }

      console.log('Fetching all orders...');
      const res = await api.get("/api/orders/all");
      console.log('Orders response:', {
        status: res.status,
        dataLength: res.data?.length || 0
      });
      
      if (!res.data || !Array.isArray(res.data)) {
        console.error('Invalid response data:', res.data);
        toast.error("Invalid data received from server");
        return;
      }

      setAllOrders(res.data);
      setShowAllOrders(true);
      toast.success(`Loaded ${res.data.length} orders`);
    } catch (err) {
      console.error("Error fetching all orders:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          headers: err.config?.headers
        }
      });
      toast.error(err.response?.data?.details || "Failed to load all orders");
      setAllOrders([]); // Set empty array as fallback
    }
  };

  const fetchProductStats = async () => {
    try {
      const res = await api.get("/api/products/stats");
      return {
        totalProducts: res.data.totalProducts || 0,
        activeProducts: res.data.activeProducts || 0,
        lowStock: res.data.lowStock || 0,
        outOfStock: res.data.outOfStock || 0,
        inventoryValue: res.data.inventoryValue || 0
      };
    } catch (err) {
      console.error("Error fetching product stats:", err);
      toast.error("Failed to load product statistics");
      return {
        totalProducts: 0,
        activeProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        inventoryValue: 0
      };
    }
  };

  const { data: productStats = {
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0
  }, refetch: refetchProductStats } = useQuery({
    queryKey: ['productStats'],
    queryFn: fetchProductStats,
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true, // Refresh when window regains focus
    staleTime: 0, // Consider data stale immediately
  });

  // Trigger refetch when component mounts and when products are updated
  useEffect(() => {
    refetchProductStats();
  }, [refetchProductStats]);

  // Add debug log for product stats updates
  useEffect(() => {
    console.log('Product Stats Updated:', productStats);
  }, [productStats]);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/api/analytics/stats");
      return res.data || {
        ordersThisMonth: 0,
        activeProducts: 0,
        adminUsers: 0,
        ordersChange: "",
        totalRevenue: 0,
        revenueChange: 0
      };
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to load dashboard statistics");
      return {
        ordersThisMonth: 0,
        activeProducts: 0,
        adminUsers: 0,
        ordersChange: "",
        totalRevenue: 0,
        revenueChange: 0
      };
    }
  };

  const { data: dashboardStats = {
    ordersThisMonth: 0,
    activeProducts: 0,
    adminUsers: 0,
    ordersChange: "",
    totalRevenue: 0,
    revenueChange: 0
  }, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 5000 // optional: live update every 5s
  });

  const fetchAdminCount = async () => {
    try {
      const res = await api.get("/api/admins/count");
      return res.data.count;
    } catch (err) {
      console.error("Error fetching admin count:", err);
      toast.error("Failed to load admin count");
      return 0; // Return a default value to prevent undefined
    }
  };

  const { data: adminCount = 0, refetch: refetchAdminCount } = useQuery({
    queryKey: ['adminCount'],
    queryFn: fetchAdminCount,
    refetchInterval: 5000, // optional: live update every 5s
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePwdMsg("");
    if (newPassword !== confirmPassword) {
      setChangePwdMsg("New passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/api/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChangePwdMsg("Password changed successfully!");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setShowChangePassword(false), 1200);
    } catch (err) {
      setChangePwdMsg(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        {/* Remove any extra space above the title */}
        <style>{`
          .analytics-header { margin-top: 0 !important; padding-top: 0 !important; }
          .analytics-header h2 { margin-top: 0 !important; padding-top: 0 !important; }
          .main-content { margin-top: 0 !important; padding-top: 0 !important; }
          .main-content > *:first-child { margin-top: 0 !important; padding-top: 0 !important; }
        `}</style>
        <div className="analytics-header">
          <h2>Dashboard</h2>
          <div className="analytics-header-right">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
              />
              <span className="search-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><line x1="16" y1="16" x2="12.5" y2="12.5"/></svg>
              </span>
            </div>
            <span className="notification-icon">🔔</span>
            <span className="profile-icon" onClick={() => setShowChangePassword(true)}>👤</span>
          </div>
        </div>
        {/* Change Password Modal */}
        <Modal
          isOpen={showChangePassword}
          onRequestClose={() => setShowChangePassword(false)}
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
              <button type="button" onClick={() => setShowChangePassword(false)} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#eee', color: '#333', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#c6aa62', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Change</button>
            </div>
          </form>
        </Modal>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 0 }}>
          {/* Stat Cards */}
          <div className="stat-grid" style={{ margin: '32px 0 0 0' }}>
            <StatCard 
              title="Total Revenue" 
              value={`₹${(dashboardStats?.totalRevenue || 0).toLocaleString()}`} 
              change={`${dashboardStats?.revenueChange || "0%"} vs prev month`}
              type={parseFloat(dashboardStats?.revenueChange) > 0 ? "success" : "danger"}
            />
            <StatCard 
              title="Orders This Month" 
              value={dashboardStats?.ordersThisMonth || 0} 
              change={`${dashboardStats?.ordersChange || "0%"} vs prev month`}
              type={parseFloat(dashboardStats?.ordersChange) > 0 ? "success" : "danger"}
            />
            <StatCard 
              title="Average Order Value" 
              value={`₹${dashboardStats?.avgOrderValue?.toLocaleString() || '0'}`}
              change={`${dashboardStats?.avgOrderValueChange || "0%"} vs prev month`}
              type={parseFloat(dashboardStats?.avgOrderValueChange) > 0 ? "success" : "danger"}
            />
            <StatCard 
              title="Active Products" 
              value={productStats?.activeProducts || 0} 
              change={`${((productStats?.activeProducts / (productStats?.totalProducts || 1)) * 100).toFixed(1)}% of inventory`}
              type="success"
            />
            <StatCard 
              title="Low Stock Items" 
              value={productStats?.lowStock || 0} 
              change={`${((productStats?.lowStock / (productStats?.totalProducts || 1)) * 100).toFixed(1)}% of inventory`}
              type="warning"
            />
            <StatCard 
              title="Out of Stock" 
              value={productStats?.outOfStock || 0} 
              change={`${((productStats?.outOfStock / (productStats?.totalProducts || 1)) * 100).toFixed(1)}% of inventory`}
              type="danger"
            />
            <StatCard 
              title="Inventory Value" 
              value={`₹${(productStats?.inventoryValue || 0).toLocaleString()}`}
              change="Current stock value"
              type="default"
            />
          </div>
          {/* Charts */}
          <div className="charts" style={{ margin: '32px 0 0 0' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 20, color: '#222', marginBottom: 16 }}>Sales Overview</h3>
              <SalesChart data={salesData} />
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 20, color: '#222', marginBottom: 16 }}>Revenue Distribution</h3>
              <RevenuePie data={revenueData} />
            </div>
          </div>
          {/* Recent Orders Section */}
          <div style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#222', fontSize: '20px' }}>
                {showAllOrders ? 'All Orders' : 'Recent Orders'}
              </h2>
              <button 
                onClick={() => {
                  if (showAllOrders) {
                    setShowAllOrders(false);
                  } else {
                    fetchAllOrders();
                  }
                }}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #c6aa62',
                  background: '#fff',
                  color: '#c6aa62', 
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#c6aa62';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#c6aa62';
                }}
              >
                {showAllOrders ? 'Show Recent' : 'View All'}
              </button>
            </div>
            <OrdersTable orders={showAllOrders ? allOrders : orders} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
