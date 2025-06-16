const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const ForumService = require("../services/forumService");

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
 *                     numberOfLikes:
 *                       type: number
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
 *                   numberOfLikes:
 *                     type: number
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

/**
 * @swagger
 * /api/forum/{id}:
 *   get:
 *     summary: Get a specific forum post with feedback
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum post ID
 *     responses:
 *       200:
 *         description: Forum post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 numberOfLikes:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 feedback:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       reply:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Forum post not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const forumPost = await ForumService.getForumPostById(req.params.id);
    res.status(200).json(forumPost);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/forum/{id}:
 *   put:
 *     summary: Update a forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the forum post
 *               content:
 *                 type: string
 *                 description: The content of the forum post
 *     responses:
 *       200:
 *         description: Forum post updated successfully
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
 *                     numberOfLikes:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Forum post not found
 */
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const accountId = req.userId;

    if (!title && !content) {
      return res.status(400).json({
        message: "At least one field (title or content) is required!",
        status: 400,
      });
    }

    const forumPost = await ForumService.updateForumPost({
      postId: req.params.id,
      accountId,
      title,
      content,
    });

    res.status(200).json({
      message: "Forum post updated successfully",
      data: forumPost,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/forum/{id}:
 *   delete:
 *     summary: Delete a forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum post ID
 *     responses:
 *       200:
 *         description: Forum post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Forum post not found
 */
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const accountId = req.userId;
    const result = await ForumService.deleteForumPost({
      postId: req.params.id,
      accountId,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/forum/{id}/like:
 *   put:
 *     summary: Like a forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum post ID
 *     responses:
 *       200:
 *         description: Forum post liked successfully
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
 *                     numberOfLikes:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Forum post not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/like", verifyToken, async (req, res, next) => {
  try {
    const forumPost = await ForumService.likeForumPost(req.params.id);
    res.status(200).json({
      message: "Forum post liked successfully",
      data: {
        _id: forumPost._id,
        accountId: forumPost.accountId._id,
        title: forumPost.title,
        content: forumPost.content,
        numberOfLikes: forumPost.numberOfLikes,
        createdAt: forumPost.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/forum/{id}/feedback:
 *   post:
 *     summary: Add feedback to a forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *                 description: The feedback reply
 *     responses:
 *       201:
 *         description: Feedback added successfully
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
 *                     fullName:
 *                       type: string
 *                     reply:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Forum post not found
 */
router.post("/:id/feedback", verifyToken, async (req, res, next) => {
  try {
    const { reply } = req.body;
    const accountId = req.userId;

    if (!reply) {
      return res.status(400).json({
        message: "Reply is required!",
        status: 400,
      });
    }

    const feedback = await ForumService.addFeedback({
      accountId,
      forumId: req.params.id,
      reply,
    });

    res.status(201).json({
      message: "Feedback added successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
