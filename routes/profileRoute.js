const express = require("express");
const router = express.Router();
const profileService = require("../services/profileService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /account/profile:
 *   get:
 *     summary: Get account profile information
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved account profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 balance:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.get("/profile", verifyToken, async (req, res, next) => {
  try {
    const account = await profileService.getAccountProfile(req.userId);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /account/profile:
 *   put:
 *     summary: Update account profile information
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated account profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 balance:
 *                   type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.put("/profile", verifyToken, async (req, res, next) => {
  try {
    const updates = req.body;
    const account = await profileService.updateAccountProfile(req.userId, updates);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
