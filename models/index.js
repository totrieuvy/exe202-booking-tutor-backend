const mongoose = require("mongoose");

const Account = require("./account");
const Certification = require("./certification");
const Course = require("./course");
const Feedback = require("./feedback");

const db = {};

db.Account = Account;
db.Certification = Certification;
db.Course = Course;
db.Feedback = Feedback;

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
