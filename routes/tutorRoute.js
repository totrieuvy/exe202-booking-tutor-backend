const express = require("express");
const router = express.Router();
const TutorService = require("../services/tutorService");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs"); // Added missing fs import

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG/JPG/PNG images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to check if user is a Tutor
const isTutor = (req, res, next) => {
  if (req.userRole !== "Tutor") {
    return res.status(403).json({
      message: "Access denied: Tutor role required",
      status: 403,
    });
  }
  next();
};

/**
 * @swagger
 * /api/tutor/order-details:
 *   get:
 *     summary: Get order details for courses created by the tutor
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of order details for tutor's courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderDetailId:
 *                     type: string
 *                     description: ID of the order detail
 *                   courseName:
 *                     type: string
 *                     description: Name of the course
 *                   coursePrice:
 *                     type: number
 *                     description: Price of the course
 *                   quantity:
 *                     type: number
 *                     description: Quantity ordered
 *                   price:
 *                     type: number
 *                     description: Price for this order detail
 *                   isFinishCourse:
 *                     type: boolean
 *                     description: Whether the course is completed
 *                   timeFinishCourse:
 *                     type: string
 *                     format: date-time
 *                     description: Time the course was completed
 *                   certificateOfCompletion:
 *                     type: string
 *                     description: URL of the completion certificate
 *                   order:
 *                     type: object
 *                     properties:
 *                       account:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       totalAmount:
 *                         type: number
 *                       status:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a Tutor)
 *       500:
 *         description: Server error
 */
router.get("/order-details", verifyToken, isTutor, async (req, res) => {
  try {
    const orderDetails = await TutorService.getTutorOrderDetails(req.userId);
    res.json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tutor/complete-course/{orderDetailId}:
 *   patch:
 *     summary: Update order detail to mark course as completed with certificate image
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderDetailId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the order detail to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPEG/JPG/PNG image for certificate
 *     responses:
 *       200:
 *         description: Updated order detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderDetailId:
 *                   type: string
 *                   description: ID of the order detail
 *                 isFinishCourse:
 *                   type: boolean
 *                   description: Whether the course is completed
 *                 timeFinishCourse:
 *                   type: string
 *                   format: date-time
 *                   description: Time the course was completed
 *                 certificateOfCompletion:
 *                   type: string
 *                   description: URL of the uploaded certificate image
 *       400:
 *         description: Invalid input or image format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a Tutor or not course creator)
 *       404:
 *         description: OrderDetail or Course not found
 *       500:
 *         description: Server error
 */
router.patch("/complete-course/:orderDetailId", verifyToken, isTutor, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const orderDetailId = req.params.orderDetailId;
    if (!mongoose.isValidObjectId(orderDetailId)) {
      return res.status(400).json({ message: "Invalid orderDetailId" });
    }

    const result = await TutorService.completeCourse(orderDetailId, req.userId, req.file);
    res.json(result);
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 403).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tutor/courses/{accountId}:
 *   get:
 *     summary: Get all courses created by a specific account
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the account whose courses are to be retrieved
 *     responses:
 *       200:
 *         description: List of courses created by the account
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseId:
 *                     type: string
 *                     description: ID of the course
 *                   name:
 *                     type: string
 *                     description: Name of the course
 *                   description:
 *                     type: string
 *                     description: Description of the course
 *                   image:
 *                     type: string
 *                     description: URL of the course image
 *                   price:
 *                     type: number
 *                     description: Price of the course
 *                   isActive:
 *                     type: boolean
 *                     description: Whether the course is active
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation date of the course
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update date of the course
 *       400:
 *         description: Invalid accountId
 *       500:
 *         description: Server error
 */
router.get("/courses/:accountId", async (req, res) => {
  try {
    const accountId = req.params.accountId;
    if (!mongoose.isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid accountId" });
    }

    const courses = await TutorService.getCoursesByAccountId(accountId);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tutor/certifications:
 *   get:
 *     summary: Get all certifications for the logged-in tutor
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of certifications for the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   certificationId:
 *                     type: string
 *                     description: ID of the certification
 *                   experience:
 *                     type: number
 *                     description: Years of experience
 *                   name:
 *                     type: string
 *                     description: Name of the certification
 *                   description:
 *                     type: string
 *                     description: Description of the certification
 *                   image:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: URLs of the certification images
 *                   isChecked:
 *                     type: boolean
 *                     description: Whether the certification is verified
 *                   isCanTeach:
 *                     type: boolean
 *                     description: Whether the tutor can teach based on this certification
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation date of the certification
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update date of the certification
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a Tutor)
 *       500:
 *         description: Server error
 */
router.get("/certifications", verifyToken, isTutor, async (req, res) => {
  try {
    const certifications = await TutorService.getTutorCertifications(req.userId);
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
