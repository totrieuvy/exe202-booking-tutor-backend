const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const chapterContentService = require("../services/chapterContentService");
const { body, param, query, validationResult } = require("express-validator");

// POST /api/chapters - Create a new chapter
/**
 * @swagger
 * /api/chapters:
 *   post:
 *     summary: Create a new chapter
 *     tags: [Chapters]
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
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *                 description: The chapter title
 *               courseId:
 *                 type: string
 *                 description: The ID of the course
 *     responses:
 *       201:
 *         description: Chapter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chapter'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  verifyToken,
  [
    body("title").notEmpty().withMessage("Chapter title is required"),
    body("courseId").notEmpty().isMongoId().withMessage("Valid courseId is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const chapter = await chapterContentService.createChapter({
        ...req.body,
        createdBy: req.userId,
      });
      res.status(201).json(chapter);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/contents - Create a new content
/**
 * @swagger
 * /api/chapters/contents:
 *   post:
 *     summary: Create a new content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapterId
 *               - contentDescription
 *             properties:
 *               chapterId:
 *                 type: string
 *                 description: The ID of the chapter
 *               contentDescription:
 *                 type: string
 *                 enum: [text, video, image, audio]
 *                 description: The type of content
 *     responses:
 *       201:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/contents",
  verifyToken,
  [
    body("chapterId").notEmpty().isMongoId().withMessage("Valid chapterId is required"),
    body("contentDescription")
      .notEmpty()
      .isIn(["text", "video", "image", "audio"])
      .withMessage("Valid content type is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const content = await chapterContentService.createContent({
        ...req.body,
        createdBy: req.userId,
      });
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/chapters/course/:courseId - Get chapters by courseId
/**
 * @swagger
 * /api/chapters/course/{courseId}:
 *   get:
 *     summary: Get all chapters for a specific course
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: List of chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chapter'
 *       400:
 *         description: Invalid courseId
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/course/:courseId",
  [param("courseId").isMongoId().withMessage("Valid courseId is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const chapters = await chapterContentService.getChaptersByCourseId(req.params.courseId);
      res.json(chapters);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/contents/chapter/:chapterId - Get contents by chapterId
/**
 * @swagger
 * /api/contents/chapter/{chapterId}:
 *   get:
 *     summary: Get all contents for a specific chapter
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chapter ID
 *     responses:
 *       200:
 *         description: List of contents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       400:
 *         description: Invalid chapterId
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/contents/chapter/:chapterId",
  [param("chapterId").isMongoId().withMessage("Valid chapterId is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const contents = await chapterContentService.getContentsByChapterId(req.params.chapterId);
      res.json(contents);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
