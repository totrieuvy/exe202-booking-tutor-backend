const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const ForumService = require("../services/forumService");
const Forum = require("../models/forum");
const Account = require("../models/account");

/**
 * @swagger
 * /api/forum:
 *   post:
 *     summary: Create a new forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the forum post
 *               content:
 *                 type: string
 *                 description: The content of the forum post
 *     responses:
 *       201:
 *         description: Forum post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     accountId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const accountId = req.userId;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required!",
        status: 400,
      });
    }

    const forumPost = await ForumService.createForumPost({
      accountId,
      title,
      content,
    });

    res.status(201).json({
      message: "Forum post created successfully",
      data: forumPost,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/forum:
 *   get:
 *     summary: Get all forum posts
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of forum posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   fullName:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const forumPosts = await ForumService.getAllForumPosts();
    res.status(200).json(forumPosts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
