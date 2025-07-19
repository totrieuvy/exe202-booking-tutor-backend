const express = require("express");
const router = express.Router();
const accountService = require("../services/accountService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts except the logged-in user
 *     description: Retrieves all accounts except the authenticated user's account, accessible to authenticated users
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
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
 *                   example: Accounts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           role:
 *                             type: string
 *                           status:
 *                             type: string
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
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await accountService.getAllAccountsExceptCurrent(userId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get accounts route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/accounts/{accountId}:
 *   get:
 *     summary: Get account by ID
 *     description: Retrieves details of a specific account by its ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account
 *     responses:
 *       200:
 *         description: Account retrieved successfully
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
 *                   example: Account retrieved successfully
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
 *                         avatar:
 *                           type: string
 *                         role:
 *                           type: string
 *                         status:
 *                           type: string
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
router.get("/:accountId", verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const result = await accountService.getAccountById(accountId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get account by ID route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

module.exports = router;
