const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required!"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required!"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required!"],
    },
    price: {
      type: Number,
      required: [true, "Price is required!"],
    },
    isFinishCourse: {
      type: Boolean,
      default: false,
    },
    timeFinishCourse: {
      type: Date,
      default: null,
    },
    certificateOfCompletion: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);

module.exports = OrderDetail;
