const mongoose = require("mongoose");
const OrderDetail = require("../models/orderDetail");
const Course = require("../models/course");
const Order = require("../models/order");
const path = require("path");
const fs = require("fs");

class TutorService {
  // Get all orderDetails for courses created by the tutor
  static async getTutorOrderDetails(tutorId) {
    // Find courses created by the tutor
    const courses = await Course.find({ createdBy: tutorId }).select("_id");

    if (!courses.length) {
      return [];
    }

    const courseIds = courses.map((course) => course._id);

    // Find orderDetails for these courses
    const orderDetails = await OrderDetail.find({ course: { $in: courseIds } })
      .populate({
        path: "order",
        select: "account totalAmount status",
        populate: {
          path: "account",
          select: "fullName email",
        },
      })
      .populate({
        path: "course",
        select: "name price",
      })
      .lean();

    return orderDetails.map((detail) => ({
      orderDetailId: detail._id,
      courseName: detail.course.name,
      coursePrice: detail.course.price,
      quantity: detail.quantity,
      price: detail.price,
      isFinishCourse: detail.isFinishCourse,
      timeFinishCourse: detail.timeFinishCourse,
      certificateOfCompletion: detail.certificateOfCompletion,
      order: {
        account: {
          fullName: detail.order.account.fullName,
          email: detail.order.account.email,
        },
        totalAmount: detail.order.totalAmount,
        status: detail.order.status,
      },
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
    }));
  }

  // Update orderDetail with completion details and image
  static async completeCourse(orderDetailId, tutorId, imageFile) {
    // Verify the orderDetail exists
    const orderDetail = await OrderDetail.findById(orderDetailId);
    if (!orderDetail) {
      throw new Error("OrderDetail not found");
    }

    // Verify the course belongs to the tutor
    const course = await Course.findById(orderDetail.course);
    if (!course) {
      throw new Error("Course not found");
    }
    if (course.createdBy.toString() !== tutorId.toString()) {
      throw new Error("Unauthorized: You are not the creator of this course");
    }

    // Generate image URL (adjust for cloud storage if needed)
    const imageUrl = `${process.env.BASE_URL}/uploads/${imageFile.filename}`;

    // Update orderDetail
    orderDetail.isFinishCourse = true;
    orderDetail.timeFinishCourse = new Date();
    orderDetail.certificateOfCompletion = imageUrl;

    await orderDetail.save();

    return {
      orderDetailId: orderDetail._id,
      isFinishCourse: orderDetail.isFinishCourse,
      timeFinishCourse: orderDetail.timeFinishCourse,
      certificateOfCompletion: orderDetail.certificateOfCompletion,
    };
  }
}

module.exports = TutorService;
