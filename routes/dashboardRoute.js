const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboardService");

/**
 * @swagger
 * /api/dashboard/revenue/{year}:
 *   get:
 *     summary: Get revenue statistics by month for a given year
 *     description: Calculates 15% of totalAmount from completed orders, grouped by month for the specified year.
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *         required: true
 *         description: The year for revenue calculation (e.g., 2025)
 *     responses:
 *       200:
 *         description: Revenue statistics by month
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: integer
 *                     description: Month number (1-12)
 *                   revenue:
 *                     type: number
 *                     description: Revenue (15% of totalAmount)
 *       400:
 *         description: Invalid year
 *       500:
 *         description: Server error
 */
router.get("/revenue/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ message: "Invalid year" });
    }
    const revenue = await dashboardService.getRevenueByYear(year);
    res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/account-stats:
 *   get:
 *     summary: Get statistics of Active and Inactive Tutors and Users
 *ilab:     description: Counts the number of Active and Inactive accounts for Tutors and Users.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Account statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tutors:
 *                   type: object
 *                   properties:
 *                     Active:
 *                       type: integer
 *                     Inactive:
 *                       type: integer
 *                 users:
 *                   type: object
 *                   properties:
 *                     Active:
 *                       type: integer
 *                     Inactive:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/account-stats", async (req, res) => {
  try {
    const stats = await dashboardService.getAccountStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/course-stats:
 *   get:
 *     summary: Get statistics of Active and Inactive Courses
 *     description: Counts the number of Active (isActive true) and Inactive (isActive false) courses.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Course statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Active:
 *                   type: integer
 *                   description: Number of courses with isActive true
 *                 Inactive:
 *                   type: integer
 *                   description: Number of courses with isActive false
 *       500:
 *         description: Server error
 */
router.get("/course-stats", async (req, res) => {
  try {
    const stats = await dashboardService.getCourseStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/top-tutor:
 *   get:
 *     summary: Get the Tutor with the most completed courses
 *     description: Identifies the Tutor with the highest number of completed courses (isFinishCourse true) based on courses they created.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Top Tutor information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tutor:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                 completedCourses:
 *                   type: integer
 *                   description: Number of completed courses
 *       404:
 *         description: No Tutor found
 *       500:
 *         description: Server error
 */
router.get("/top-tutor", async (req, res) => {
  try {
    const topTutor = await dashboardService.getTopTutor();
    if (!topTutor) {
      return res.status(404).json({ message: "No Tutor found" });
    }
    res.status(200).json(topTutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
