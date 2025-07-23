const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const chapterService = require("../services/chapterService");
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
    body("courseId")
      .notEmpty()
      .isMongoId()
      .withMessage("Valid courseId is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const chapter = await chapterService.createChapter({
        ...req.body,
        createdBy: req.userId,
      });
      res.status(201).json(chapter);
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
      const chapters = await chapterService.getChaptersByCourseId(
        req.params.courseId
      );
      res.json(chapters);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
