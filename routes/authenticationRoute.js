const express = require("express");
const authenticationService = require("../services/authenticationService");
const bodyParser = require("body-parser");

const authenticationRoute = express.Router();
authenticationRoute.use(bodyParser.json());

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully, OTP sent to email
 *       400:
 *         description: Account already exists
 *       500:
 *         description: Internal server error
 */
authenticationRoute.post("/register", async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const result = await authenticationService.register({ fullName, email, phone, password });
  res.status(result.status).json({ message: result.message });
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and activate account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
authenticationRoute.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const result = await authenticationService.verifyOtp(email, otp);
  res.status(result.status).json({ message: result.message });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input or account not active
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
authenticationRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await authenticationService.login(email, password);
  res.status(result.status).json(result.data);
});

module.exports = authenticationRoute;
