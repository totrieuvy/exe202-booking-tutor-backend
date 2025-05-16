const db = require("../models/index");

class StatsService {
  // Get revenue by month for a given year (15% of totalAmount)
  static async getMonthlyRevenue(year) {
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year + 1, 0, 1); // January 1st of next year

    const revenueData = await db.Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: "Completed", // Only completed orders
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Initialize array for all 12 months
    const monthlyRevenue = Array(12).fill(0);
    revenueData.forEach((data) => {
      monthlyRevenue[data._id - 1] = (data.totalRevenue * 0.15).toFixed(2); // 15% of total
    });

    return monthlyRevenue.map((revenue, index) => ({
      month: index + 1,
      revenue: parseFloat(revenue),
    }));
  }

  // Get count of Accounts by status
  static async getAccountStatusStats() {
    const stats = await db.Account.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { Active: 0, Inactive: 0 };
    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  // Get count of Courses by isActive status
  static async getCourseStatusStats() {
    const stats = await db.Course.aggregate([
      {
        $group: {
          _id: "$isActive",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { Active: 0, Inactive: 0 };
    stats.forEach((stat) => {
      result[stat._id ? "Active" : "Inactive"] = stat.count;
    });

    return result;
  }

  // Get Account with most completed orderDetails
  static async getTopAccountByCompletedCourses() {
    const topAccount = await db.OrderDetail.aggregate([
      {
        $match: {
          isFinishCourse: true,
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderData",
        },
      },
      {
        $unwind: "$orderData",
      },
      {
        $group: {
          _id: "$orderData.account",
          completedCourses: { $sum: 1 },
        },
      },
      {
        $sort: { completedCourses: -1 },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "_id",
          as: "accountData",
        },
      },
      {
        $unwind: "$accountData",
      },
      {
        $project: {
          accountId: "$_id",
          fullName: "$accountData.fullName",
          email: "$accountData.email",
          completedCourses: 1,
        },
      },
    ]);

    return topAccount[0] || null;
  }
}

module.exports = StatsService;
