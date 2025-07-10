// src/components/SalesChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/AdminDashboard.css";

const defaultData = [
  { date: "2024-03-01", orders: 0, revenue: 0 },
  { date: "2024-03-02", orders: 0, revenue: 0 },
  { date: "2024-03-03", orders: 0, revenue: 0 },
];

const SalesChart = ({ data = defaultData }) => {
  return (
    <div style={{ 
      flex: 1, 
      background: '#fff', 
      border: '1.5px solid #e5e5e5', 
      borderRadius: 16, 
      padding: 24, 
      boxShadow: '0 2px 8px rgba(198,170,98,0.04)', 
      aspectRatio: '1/1',
      minWidth: '400px',
      minHeight: '400px'
    }}>
      <h4 style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 16 }}>Sales Overview</h4>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke="#666"
          />
          <YAxis stroke="#666" />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            formatter={(value, name) => [value, name === 'orders' ? 'Orders' : 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#c6aa62" 
            strokeWidth={2}
            dot={false}
            name="Orders"
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b7e3b" 
            strokeWidth={2}
            dot={false}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
