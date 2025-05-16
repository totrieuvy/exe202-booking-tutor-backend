const express = require("express");
const router = express.Router();
const StatsService = require("../services/dashboardService");

/**
 * @swagger
 * /api/dashboard/revenue/{year}:
 *   get:
 *     summary: Get monthly revenue for a specific year
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: The year to calculate revenue (e.g., 2025)
 *     responses:
 *       200:
 *         description: Monthly revenue data
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
 *                     description: Revenue for the month (15% of totalAmount)
 *       400:
 *         description: Invalid year provided
 *       500:
 *         description: Server error
 */
router.get("/revenue/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
      return res.status(400).json({ message: "Invalid year" });
    }
    const revenue = await StatsService.getMonthlyRevenue(year);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/accounts/status:
 *   get:
 *     summary: Get count of accounts by status
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Account status statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Active:
 *                   type: integer
 *                   description: Number of active accounts
 *                 Inactive:
 *                   type: integer
 *                   description: Number of inactive accounts
 *       500:
 *         description: Server error
 */
router.get("/accounts/status", async (req, res) => {
  try {
    const stats = await StatsService.getAccountStatusStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/courses/status:
 *   get:
 *     summary: Get count of courses by active status
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Course status statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Active:
 *                   type: integer
 *                   description: Number of active courses
 *                 Inactive:
 *                   type: integer
 *                   description: Number of inactive courses
 *       500:
 *         description: Server error
 */
router.get("/courses/status", async (req, res) => {
  try {
    const stats = await StatsService.getCourseStatusStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/top-account:
 *   get:
 *     summary: Get account with most completed courses
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Account with most completed courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                   description: ID of the account
 *                 fullName:
 *                   type: string
 *                   description: Full name of the account
 *                 email:
 *                   type: string
 *                   description: Email of the account
 *                 completedCourses:
 *                   type: integer
 *                   description: Number of completed courses
 *       404:
 *         description: No account with completed courses found
 *       500:
 *         description: Server error
 */
router.get("/top-account", async (req, res) => {
  try {
    const topAccount = await StatsService.getTopAccountByCompletedCourses();
    if (!topAccount) {
      return res.status(404).json({ message: "No account with completed courses found" });
    }
    res.json(topAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
