const express = require("express");
const router = express.Router();
const courseService = require("../services/courseService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     description: Creates a new course for an authenticated user with a verified certification (isChecked and isCanTeach must be true)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the course
 *                 example: Introduction to Cloud Computing
 *               description:
 *                 type: string
 *                 description: Description of the course
 *                 example: Learn the fundamentals of cloud computing
 *               image:
 *                 type: string
 *                 description: URL of the course image
 *                 example: https://example.com/course.jpg
 *               price:
 *                 type: number
 *                 description: Price of the course
 *                 example: 99.99
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Course created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *                         price:
 *                           type: number
 *                         createdBy:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid input or duplicate course name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Course name must be unique
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized! Invalid token
 *       403:
 *         description: Forbidden (inactive account or no valid certification)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You need a verified certification (isChecked and isCanTeach) to create a course
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Account not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, image, price } = req.body;
    const userId = req.userId;
    const result = await courseService.createCourse({
      name,
      description,
      image,
      price,
      userId,
    });
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in create course route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses with account and certification details
 *     description: Retrieves all courses along with their creator's account details and certifications, sorted by the highest experience of the creator's certifications in descending order, accessible to authenticated users
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Courses retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           course:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               createdBy:
 *                                 type: string
 *                               isActive:
 *                                 type: boolean
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                           account:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                           certifications:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *                                 image:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                 experience:
 *                                   type: number
 *                                 isChecked:
 *                                   type: boolean
 *                                 isCanTeach:
 *                                   type: boolean
 *                                 createBy:
 *                                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized! Invalid token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/", async (req, res) => {
  try {
    const result = await courseService.getCoursesWithDetails();
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get courses route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/courses/account/{accountId}:
 *   get:
 *     summary: Get account details with certifications and courses
 *     description: Retrieves account details, certifications, and courses for a specific account ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Account details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         status:
 *                           type: string
 *                         role:
 *                           type: string
 *                     certifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                           experience:
 *                             type: number
 *                           isChecked:
 *                             type: boolean
 *                           isCanTeach:
 *                             type: boolean
 *                           createBy:
 *                             type: string
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                           price:
 *                             type: number
 *                           createdBy:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid account ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Valid account ID is required
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Account not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/account/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;
    const result = await courseService.getAccountDetailsWithCourses(accountId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get account details route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

module.exports = router;
