const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order and generate VNPay payment URL
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course to purchase
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Order created successfully with VNPay payment URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     url:
 *                       type: string
 *                       description: VNPay payment URL
 *       400:
 *         description: Bad request - Invalid input or course not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - No token provided
 *       500:
 *         description: Internal server error
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const accountId = req.userId; // Extracted from token
    const result = await orderService.createOrder({ req, res, courseId, accountId });
    res.status(result.status).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/pay:
 *   patch:
 *     summary: Update order status to Paid
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to update
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Order status updated to Paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid order ID or order already paid
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - No token provided
 *       404:
 *         description: Not found - Order not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/pay", verifyToken, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const accountId = req.userId; // Extracted from token
    const result = await orderService.updateOrderStatus({ orderId, accountId });
    res.status(result.status).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the authenticated account
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       account:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       paymentMethod:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       totalAmount:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: ["Pending", "Completed", "Cancelled"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       orderDetails:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             course:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *                                 image:
 *                                   type: string
 *                             quantity:
 *                               type: number
 *                             price:
 *                               type: number
 *                             isFinishCourse:
 *                               type: boolean
 *                             timeFinishCourse:
 *                               type: string
 *                               format: date-time
 *                             certificateOfCompletion:
 *                               type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - No token provided
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const accountId = req.userId; // Extracted from token
    const result = await orderService.getOrdersByAccount({ accountId });
    res.status(result.status).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
