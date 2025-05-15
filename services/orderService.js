const db = require("../models/index");
const httpErrors = require("http-errors");
const crypto = require("crypto");

const orderService = {
  async createOrder({ req, res, courseId, accountId }) {
    try {
      // Validate inputs
      if (!courseId || !accountId) {
        throw httpErrors.BadRequest("Course ID and account ID are required");
      }

      // Check if course exists and is active
      const course = await db.Course.findById(courseId);
      if (!course || !course.isActive) {
        throw httpErrors.NotFound("Course not found or inactive");
      }

      // Check if account exists
      const account = await db.Account.findById(accountId);
      if (!account) {
        throw httpErrors.NotFound("Account not found");
      }

      // Find or create VNPay payment method
      let paymentMethod = await db.PaymentMethod.findOne({ name: "VNPay" });
      if (!paymentMethod) {
        paymentMethod = new db.PaymentMethod({ name: "VNPay" });
        await paymentMethod.save();
      }

      // Calculate total amount (price * quantity)
      const quantity = 1; // Default quantity as requested
      const totalAmount = course.price * quantity;

      // Create Order
      const order = new db.Order({
        account: accountId,
        paymentMethod: paymentMethod._id,
        totalAmount: totalAmount,
        status: "Pending",
      });
      await order.save();

      // Create OrderDetail
      const orderDetail = new db.OrderDetail({
        order: order._id,
        course: courseId,
        quantity: quantity,
        price: course.price,
        isFinishCourse: false,
        timeFinishCourse: null,
        certificateOfCompletion: null,
      });
      await orderDetail.save();

      // Manually construct VNPay payment URL
      const vnp_TmnCode = "9TKDVWYK";
      const vnp_HashSecret = "LH6SD44ECTBWU1PHK3D2YCOI5HLUWGPH";
      const paymentParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: vnp_TmnCode,
        vnp_Amount: totalAmount * 100, // VNPay requires amount in VND, multiplied by 100
        vnp_CurrCode: "VND",
        vnp_TxnRef: order._id.toString(),
        vnp_OrderInfo: `Payment for course: ${course.name}`,
        vnp_OrderType: "250000", // Educational service
        vnp_Locale: "vn",
        vnp_ReturnUrl: `http://localhost:3000?orderId=${order._id}`,
        vnp_IpAddr: req.ip || "127.0.0.1",
        vnp_CreateDate: dateFormat(new Date(), "yyyymmddHHMMss"), // Ensure correct format
      };

      // Sort parameters by key and create query string
      const sortedParams = Object.keys(paymentParams)
        .sort()
        .reduce((acc, key) => {
          acc[key] = paymentParams[key];
          return acc;
        }, {});
      const queryString = new URLSearchParams(sortedParams).toString();

      // Generate secure hash
      const secureHash = crypto.createHmac("sha512", vnp_HashSecret).update(queryString).digest("hex");
      const vnpayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${queryString}&vnp_SecureHash=${secureHash}`;

      console.log("Manually Generated VNPay URL:", vnpayUrl);

      return {
        status: 200,
        message: "Order created successfully",
        data: {
          orderId: order._id,
          url: vnpayUrl,
        },
      };
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  },

  async updateOrderStatus({ orderId, accountId }) {
    try {
      // Validate inputs
      if (!orderId) {
        throw httpErrors.BadRequest("Order ID is required");
      }

      // Find the order and verify ownership
      const order = await db.Order.findOne({ _id: orderId, account: accountId });
      if (!order) {
        throw httpErrors.NotFound("Order not found or unauthorized");
      }

      // Check if order is already paid
      if (order.status === "Completed") {
        throw httpErrors.BadRequest("Order is already paid");
      }

      // Update status to Paid (using "Completed" as per schema)
      order.status = "Completed";
      await order.save();

      return {
        status: 200,
        message: "Order status updated to Paid successfully",
        data: { orderId },
      };
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      throw error;
    }
  },

  async getOrdersByAccount({ accountId }) {
    try {
      // Validate input
      if (!accountId) {
        throw httpErrors.BadRequest("Account ID is required");
      }

      // Fetch orders for the account
      const orders = await db.Order.find({ account: accountId })
        .populate("paymentMethod", "name")
        .populate("account", "fullName email")
        .sort({ createdAt: -1 }); // Sort by newest first

      // Fetch order details for each order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const orderDetails = await db.OrderDetail.find({ order: order._id }).populate("course", "name price image");
          return {
            _id: order._id,
            account: order.account,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            orderDetails: orderDetails.map((detail) => ({
              course: detail.course,
              quantity: detail.quantity,
              price: detail.price,
              isFinishCourse: detail.isFinishCourse,
              timeFinishCourse: detail.timeFinishCourse,
              certificateOfCompletion: detail.certificateOfCompletion,
            })),
          };
        })
      );

      return {
        status: 200,
        message: "Orders retrieved successfully",
        data: ordersWithDetails,
      };
    } catch (error) {
      console.error("Error in getOrdersByAccount:", error);
      throw error;
    }
  },
};

// Helper function to format date as required by VNPay
function dateFormat(date, format = "yyyymmddHHMMss") {
  const pad = (num) => String(num).padStart(2, "0");
  return format
    .replace("yyyy", date.getFullYear())
    .replace("mm", pad(date.getMonth() + 1))
    .replace("dd", pad(date.getDate()))
    .replace("HH", pad(date.getHours()))
    .replace("MM", pad(date.getMinutes()))
    .replace("ss", pad(date.getSeconds()));
}

module.exports = orderService;
