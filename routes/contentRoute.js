const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const contentService = require("../services/contentService");
const { body, param, query, validationResult } = require("express-validator");

// POST /api/contents - Create a new content
/**
 * @swagger
 * /api/contents:
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
 *               - createdBy
 *             properties:
 *               chapterId:
 *                 type: string
 *                 description: The ID of the chapter
 *               contentDescription:
 *                 type: string
 *                 description: The type of content (any string)
 *               createdBy:
 *                 type: string
 *                 description: The ID of the creator
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
  "/",
  verifyToken,
  [
    body("chapterId")
      .notEmpty()
      .isMongoId()
      .withMessage("Valid chapterId is required"),
    body("contentDescription")
      .notEmpty()
      .withMessage("Content type is required"),
    body("createdBy")
      .notEmpty()
      .isMongoId()
      .withMessage("Valid creator ID is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const content = await contentService.createContent({
        ...req.body,
        createdBy: req.userId,
      });
      res.status(201).json(content);
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
  "/chapter/:chapterId",
  [param("chapterId").isMongoId().withMessage("Valid chapterId is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const contents = await contentService.getContentsByChapterId(
        req.params.chapterId
      );
      res.json(contents);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
