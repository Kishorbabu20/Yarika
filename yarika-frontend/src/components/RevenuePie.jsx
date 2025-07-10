// src/components/RevenuePie.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/AdminDashboard.css";

const defaultData = [
  { name: "Blouse", value: 400 },
  { name: "Leggings", value: 300 },
  { name: "Others", value: 200 },
];

const COLORS = ["#f1c40f", "#1abc9c", "#e67e22"];

const RevenuePie = ({ data = defaultData }) => {
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
      <h4 style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 16 }}>Revenue by Category</h4>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenuePie;
