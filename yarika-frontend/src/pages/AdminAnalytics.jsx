import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/layout/AdminHeader";
import axios from "axios";
import "../styles/AdminDashboard.css";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, ShoppingBag, TrendingUp, User, CheckCircle, PlusCircle, Trash2 } from "lucide-react";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import toast from "react-hot-toast";

const COLORS = ["#3b7e3b", "#1e40af", "#a21caf", "#dc2626"];

export default function AdminAnalytics() {
  const [tab, setTab] = useState("all");
  const [overview, setOverview] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [ordersPerDayData, setOrdersPerDayData] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [adminActivity, setAdminActivity] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    unitSold: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    unitSoldChange: 0,
    avgOrderValueChange: 0
  });
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetchOrderStatus();
    fetchOrdersPerDay();
    fetchProductPerformance();
    fetchAdminActivity();
    fetchStats();
  }, []);

  const fetchOrderStatus = async () => {
    try {
      const res = await api.get("/api/analytics/order-status");
      setOrderStatusData(res.data);
    } catch (err) {
      console.error("Error fetching order status:", err);
      toast.error("Failed to load order status data");
    }
  };
  const fetchOrdersPerDay = async () => {
    try {
      const res = await api.get("/api/analytics/orders-per-day");
      setOrdersPerDayData(res.data);
    } catch (err) {
      console.error("Error fetching orders per day:", err);
      toast.error("Failed to load orders per day data");
    }
  };
  const fetchProductPerformance = async () => {
    try {
      const res = await api.get("/api/analytics/product-performance");
      setProductPerformance(res.data);
    } catch (err) {
      console.error("Error fetching product performance:", err);
      toast.error("Failed to load product performance data");
    }
  };
  const fetchAdminActivity = async () => {
    try {
      const res = await api.get("/api/analytics/admin-activity");
      setAdminActivity(res.data);
    } catch (err) {
      console.error("Error fetching admin activity:", err);
      toast.error("Failed to load admin activity data");
    }
  };
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/analytics/stats");
      setStats(res.data || {
        totalRevenue: 0,
        unitSold: 0,
        avgOrderValue: 0,
        revenueChange: 0,
        unitSoldChange: 0,
        avgOrderValueChange: 0
      });
    } catch (err) {
      console.error("Error fetching analytics stats:", err);
      toast.error("Failed to load analytics statistics");
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    return (value || 0).toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <>
          {/* Remove any extra space above the title */}
          <style>{`
            .analytics-header { margin-top: 0 !important; padding-top: 0 !important; }
            .analytics-header h2 { margin-top: 0 !important; padding-top: 0 !important; }
            .main-content { margin-top: 0 !important; padding-top: 0 !important; }
            .main-content > *:first-child { margin-top: 0 !important; padding-top: 0 !important; }
          `}</style>
          <div className="analytics-header">
            <h2>Analytics</h2>
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
        </>
        <ChangePasswordModal isOpen={showChangePassword} onRequestClose={() => setShowChangePassword(false)} />

        <div style={{ padding: '0 32px' }}>
          {/* Filters */}
          <div className="analytics-filters">
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input type="date" className="filter-input" />
            </div>
            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input type="date" className="filter-input" />
            </div>
            <div className="filter-group">
              <label className="filter-label">Product Category</label>
              <select className="filter-select">
                <option>Dailywear</option>
                <option>Officewear</option>
                <option>Partywear</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Product Name</label>
              <select className="filter-select">
                <option>Blouse</option>
                <option>Leggings</option>
                <option>Others</option>
              </select>
            </div>
            <div className="filter-group">
              <button className="filter-button">Apply Filter</button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="analytics-stats">
            <div className="stat-card">
              <div className="stat-card-icon">
                <BarChart3 color="#c6aa62" />
              </div>
              <div className="stat-card-content">
                <h3>Total Revenue</h3>
                <p>
                  ₹{formatNumber(stats.totalRevenue)}
                  <span className="check-icon">
                    <svg width="22" height="22" fill="none" stroke="#c6aa62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="14" height="14" rx="3"/>
                      <path d="M8 12l2 2 4-4"/>
                    </svg>
                  </span>
                </p>
                <span>+{formatNumber(stats.revenueChange)}%</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">
                <ShoppingBag color="#c6aa62" />
              </div>
              <div className="stat-card-content">
                <h3>Unit Sold</h3>
                <p>
                  {formatNumber(stats.unitSold)}
                  <span className="check-icon">
                    <svg width="22" height="22" fill="none" stroke="#c6aa62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="14" height="14" rx="3"/>
                      <path d="M8 12l2 2 4-4"/>
                    </svg>
                  </span>
                </p>
                <span>+{formatNumber(stats.unitSoldChange)}%</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">
                <TrendingUp color="#c6aa62" />
              </div>
              <div className="stat-card-content">
                <h3>Average Order Value</h3>
                <p>
                  ₹{formatNumber(stats.avgOrderValue)}
                  <span className="check-icon">
                    <svg width="22" height="22" fill="none" stroke="#c6aa62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="14" height="14" rx="3"/>
                      <path d="M8 12l2 2 4-4"/>
                    </svg>
                  </span>
                </p>
                <span>+{formatNumber(stats.avgOrderValueChange)}%</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="analytics-charts">
            <div className="chart-container">
              <h4>Order Status</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span className="legend-item">● Delivered</span>
                <span className="legend-item">● Processing</span>
                <span className="legend-item">● Shipped</span>
                <span className="legend-item">● Cancelled</span>
              </div>
            </div>
            <div className="chart-container">
              <h4>Orders Per Day</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ordersPerDayData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#caa75d" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Performance Table */}
          <div className="analytics-table">
            <h3>Product Performance</h3>
            <div className="table-controls">
              <button onClick={() => setTab("all")} className={tab === 'all' ? 'active' : ''}>All</button>
              <button onClick={() => setTab("top")} className={tab === 'top' ? 'active' : ''}>Top 10</button>
              <button onClick={() => setTab("bottom")} className={tab === 'bottom' ? 'active' : ''}>Bottom 10</button>
              <button onClick={() => setTab("lowStock")} className={tab === 'lowStock' ? 'active' : ''}>Low Stock</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>UNIT SOLD</th>
                  <th>STOCK LEFT</th>
                  <th>REVENUE</th>
                  <th>AVG. PRICE</th>
                  <th>STOCK STATUS</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.map((product, i) => (
                  <tr key={i}>
                    <td>{product.name}</td>
                    <td>
                      {product.totalSold}
                      {product.totalSold > 0 && (
                        <span className="positive">↑</span>
                      )}
                    </td>
                    <td>{product.totalStock || 0}</td>
                    <td>{product.revenue?.toLocaleString()}</td>
                    <td>{product.totalSold ? Math.round(product.revenue / product.totalSold).toLocaleString() : 0}</td>
                    <td>
                      <span className={`status ${product.totalStock > 10 ? 'in-stock' : product.totalStock > 0 ? 'low-stock' : product.status === 'discontinued' ? 'discontinued' : 'out-of-stock'}`}>
                        {product.totalStock > 10 ? 'In Stock' :
                         product.totalStock > 0 ? 'Low Stock' :
                         product.status === 'discontinued' ? 'Discontinued' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Admin Activity */}
          <div className="analytics-activity">
            <h3>Recent Admin Activity</h3>
            <ul>
              {adminActivity.map((activity, i) => (
                <li key={i}>
                  {activity.status === "Updated" && <CheckCircle color="#b19049" />}
                  {activity.status === "Created" && <PlusCircle color="#3b7e3b" />}
                  {activity.status === "Deleted" && <Trash2 color="#dc2626" />}
                  <span>{activity.name}</span>
                  <span>{activity.action}</span>
                  <span>{activity.status}</span>
                  <span>{activity.time}</span>
                </li>
              ))}
            </ul>
            <div className="activity-controls">
              <button>Show More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
