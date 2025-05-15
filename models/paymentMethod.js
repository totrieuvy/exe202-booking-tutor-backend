const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Payment method name is required"],
    enum: ["VNPay", "Momo"],
    default: "VNPay",
  },
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = PaymentMethod;
