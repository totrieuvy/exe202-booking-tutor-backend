const mongoose = require("mongoose");

const Account = require("./account");
const Certification = require("./certification");
const Course = require("./course");
const Feedback = require("./feedback");
const OrderDetail = require("./orderDetail");
const PaymentMethod = require("./paymentMethod");
const Order = require("./order");
const Chapter = require("./chapter");
const Content = require("./content");

const db = {};

db.Account = Account;
db.Certification = Certification;
db.Course = Course;
db.Feedback = Feedback;
db.Order = Order;
db.OrderDetail = OrderDetail;
db.PaymentMethod = PaymentMethod;
db.Chapter = Chapter;
db.Content = Content;

db.connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("Database connection successful!!!");
    });
  } catch (error) {
    next(error);
    process.exit();
  }
};

module.exports = db;
