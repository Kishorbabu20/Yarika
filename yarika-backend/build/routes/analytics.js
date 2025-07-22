const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Admin = require("../models/Admin");
const AdminActivity = require("../models/AdminActivity");
const protect = require("../middleware/auth");

// Apply admin protection to all analytics routes
router.use(protect({ model: "admin" }));

// GET /api/analytics/order-status
router.get("/order-status", async (req, res) => {
  try {
    const statuses = await Order.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);
    // Format for recharts PieChart: [{ name: "Delivered", value: 10 }, ...]
    const formatted = statuses.map(s => ({ name: s._id, value: s.value }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

// GET /api/analytics/orders-per-day
router.get("/orders-per-day", async (req, res) => {
  try {
    const ordersPerDay = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const formatted = ordersPerDay.map(day => ({
      date: day._id,
      orders: day.count,
      revenue: day.revenue
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders per day" });
  }
});

// GET /api/analytics/product-performance
router.get("/product-performance", async (req, res) => {
  try {
    const productPerformance = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          categoryType: "$product.categoryType",
          category: "$product.category",
          totalSold: 1,
          revenue: 1,
          totalStock: "$product.totalStock",
          status: "$product.status"
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json(productPerformance);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product performance" });
  }
});

// GET /api/analytics/admin-activity
router.get("/admin-activity", async (req, res) => {
  try {
    console.log("Admin activity endpoint called");
    
    // Get recent admin activities (last 50 activities)
    const activities = await AdminActivity.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('adminId', 'name username email');

    console.log(`Found ${activities.length} admin activities`);

    // Format activities for frontend
    const formattedActivities = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.createdAt);
      
      return {
        name: activity.adminName,
        action: `${activity.action} ${activity.entityName}`,
        status: activity.action,
        time: timeAgo,
        details: activity.details,
        entityType: activity.entityType
      };
    });

    console.log("Formatted activities:", formattedActivities.slice(0, 3)); // Log first 3 activities

    res.json(formattedActivities);
  } catch (err) {
    console.error("Error fetching admin activity:", err);
    res.status(500).json({ error: "Failed to fetch admin activity" });
  }
});

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

// GET /api/analytics/stats
router.get("/stats", async (req, res) => {
  try {
    // Get the start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get the start of previous month
    const startOfPrevMonth = new Date(startOfMonth);
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

    // Calculate stats for current month
    const currentMonthStats = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfMonth },
          status: { $ne: "Cancelled" },
          payment_status: "Completed" // Only count completed payments
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          unitsSold: { $sum: "$items.quantity" },
          orderCount: { $addToSet: "$_id" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Calculate stats for previous month
    const prevMonthStats = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth },
          status: { $ne: "Cancelled" },
          payment_status: "Completed" // Only count completed payments
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          unitsSold: { $sum: "$items.quantity" },
          orderCount: { $addToSet: "$_id" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get current month values
    const totalRevenue = currentMonthStats[0]?.totalRevenue || 0;
    const unitsSold = currentMonthStats[0]?.unitsSold || 0;
    const orderCount = currentMonthStats[0]?.orderCount?.length || 0;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Get previous month values
    const prevRevenue = prevMonthStats[0]?.totalRevenue || 0;
    const prevUnitsSold = prevMonthStats[0]?.unitsSold || 0;
    const prevOrderCount = prevMonthStats[0]?.orderCount?.length || 0;
    const prevAvgOrderValue = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : "0.0";

    const unitsSoldChange = prevUnitsSold > 0
      ? ((unitsSold - prevUnitsSold) / prevUnitsSold * 100).toFixed(1)
      : "0.0";

    const avgOrderValueChange = prevAvgOrderValue > 0
      ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue * 100).toFixed(1)
      : "0.0";

    // Get active products count
    const activeProducts = await Product.countDocuments({ totalStock: { $gt: 0 } });

    // Debug log for analytics
    console.log('Analytics Stats:', {
      currentMonth: {
        revenue: totalRevenue,
        units: unitsSold,
        orders: orderCount,
        avgOrder: avgOrderValue
      },
      prevMonth: {
        revenue: prevRevenue,
        units: prevUnitsSold,
        orders: prevOrderCount,
        avgOrder: prevAvgOrderValue
      },
      changes: {
        revenue: revenueChange,
        units: unitsSoldChange,
        avgOrder: avgOrderValueChange
      }
    });

    res.json({
      totalRevenue,
      revenueChange: `${revenueChange}%`,
      unitsSold,
      unitsSoldChange: `${unitsSoldChange}%`,
      avgOrderValue,
      avgOrderValueChange: `${avgOrderValueChange}%`,
      ordersThisMonth: orderCount,
      ordersChange: `${((orderCount - prevOrderCount) / (prevOrderCount || 1) * 100).toFixed(1)}%`,
      activeProducts
    });
  } catch (err) {
    console.error("Error calculating analytics stats:", err);
    res.status(500).json({ error: "Failed to calculate analytics stats" });
  }
});

// GET /api/analytics/sales-chart
router.get("/sales-chart", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with zero values
    const allDates = [];
    for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split('T')[0]);
    }

    const formattedData = allDates.map(date => {
      const dayData = salesData.find(d => d._id === date) || { orders: 0, revenue: 0 };
      return {
        date,
        orders: dayData.orders || 0,
        revenue: dayData.revenue || 0
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching sales chart data:", err);
    res.status(500).json({ error: "Failed to fetch sales chart data" });
  }
});

module.exports = router; 