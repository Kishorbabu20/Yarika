import React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";

const data = [
  { name: "Delivered", value: 65 },
  { name: "Processing", value: 20 },
  { name: "Shipped", value: 10 },
  { name: "Cancelled", value: 5 },
];

const COLORS = ["#2ecc71", "#2980b9", "#9b59b6", "#e74c3c"];

const OrderStatusChart = () => (
  <div className="chart-card">
    <h4>Order Status</h4>
    <PieChart width={300} height={240}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </div>
);

export default OrderStatusChart;
