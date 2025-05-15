const db = require("../models/index");

const getRevenueByYear = async (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const revenue = await db.Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
        status: "Completed",
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: { $multiply: ["$totalAmount", 0.15] } },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        month: "$_id",
        revenue: "$totalRevenue",
        _id: 0,
      },
    },
  ]);

  const result = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthData = revenue.find((r) => r.month === month);
    return { month, revenue: monthData ? monthData.revenue : 0 };
  });

  return result;
};

const getAccountStats = async () => {
  const stats = await db.Account.aggregate([
    {
      $match: {
        role: { $in: ["Tutor", "User"] },
      },
    },
    {
      $group: {
        _id: {
          role: "$role",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    tutors: { active: 0, inactive: 0 },
    users: { active: 0, inactive: 0 },
  };

  stats.forEach((stat) => {
    const role = stat._id.role.toLowerCase();
    const status = stat._id.status.toLowerCase();
    result[role][status] = stat.count;
  });

  return result;
};

const getCourseStats = async () => {
  const stats = await db.Course.aggregate([
    {
      $group: {
        _id: "$isActive",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = { active: 0, inactive: 0 };
  stats.forEach((stat) => {
    const status = stat._id ? "active" : "inactive";
    result[status] = stat.count;
  });

  return result;
};

const getTopTutor = async () => {
  const topTutor = await db.OrderDetail.aggregate([
    {
      $match: {
        isFinishCourse: true,
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $lookup: {
        from: "accounts",
        localField: "course.createdBy",
        foreignField: "_id",
        as: "tutor",
      },
    },
    { $unwind: "$tutor" },
    {
      $match: {
        "tutor.role": "Tutor",
      },
    },
    {
      $group: {
        _id: "$tutor._id",
        fullName: { $first: "$tutor.fullName" },
        email: { $first: "$tutor.email" },
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
      $project: {
        tutor: {
          fullName: "$fullName",
          email: "$email",
        },
        completedCourses: 1,
        _id: 0,
      },
    },
  ]);

  return topTutor.length > 0 ? topTutor[0] : null;
};

module.exports = {
  getRevenueByYear,
  getAccountStats,
  getCourseStats,
  getTopTutor,
};
