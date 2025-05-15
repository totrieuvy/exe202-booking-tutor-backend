const express = require("express");
const router = express.Router();
const feedbackService = require("../services/feedbackService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create a new feedback
 *     tags: [Feedback]
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
 *               - rating
 *               - comment
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *                 example: 507f1f77bcf86cd799439011
 *               rating:
 *                 type: number
 *                 description: Rating (1 to 5)
 *                 example: 4
 *               comment:
 *                 type: string
 *                 description: Feedback comment
 *                 example: Great course!
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - No token provided
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { courseId, rating, comment } = req.body;
    const accountId = req.userId; // Extracted from token
    const feedback = await feedbackService.createFeedback({
      courseId,
      accountId,
      rating,
      comment,
    });
    res.status(201).json({
      message: "Feedback created successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/feedback/course/{courseId}:
 *   get:
 *     summary: Get feedback for a specific course
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request - Invalid course ID
 *       500:
 *         description: Internal server error
 */
router.get("/course/:courseId", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const feedbacks = await feedbackService.getFeedbackByCourse(courseId);
    res.status(200).json({
      message: "Feedback retrieved successfully",
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
