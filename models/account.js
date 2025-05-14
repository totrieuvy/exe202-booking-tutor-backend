const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required!"],
      unique: [true, "Full name must be unique!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: [true, "Email must be unique!"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required!"],
      unique: [true, "Phone number must be unique!"],
    },
    password: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "https://static.thenounproject.com/png/65476-200.png",
    },
    role: {
      type: String,
      enum: ["Admin", "Tutor", "User"],
      default: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiration: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
