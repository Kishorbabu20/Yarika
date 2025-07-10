import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", orders: 30 },
  { day: "Tue", orders: 20 },
  { day: "Wed", orders: 70 },
  { day: "Thu", orders: 40 },
  { day: "Fri", orders: 60 },
  { day: "Sat", orders: 80 },
  { day: "Sun", orders: 75 },
];

const OrdersPerDayChart = () => (
  <div className="chart-card">
    <h4>Orders Per Day</h4>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="orders" fill="#b19049" barSize={35} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default OrdersPerDayChart;
