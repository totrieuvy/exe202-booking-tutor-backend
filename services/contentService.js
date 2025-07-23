const mongoose = require("mongoose");
const httpErrors = require("http-errors");
const Chapter = require("../models/chapter");
const Content = require("../models/content");

const createContent = async (contentData) => {
  try {
    // Verify chapter exists
    const chapter = await Chapter.findById(contentData.chapterId);
    if (!chapter) {
      throw httpErrors.NotFound("Chapter not found");
    }

    const content = new Content({
      chapterId: contentData.chapterId,
      contentDescription: contentData.contentDescription,
      createdBy: contentData.createdBy,
    });
    await content.save();
    return content;
  } catch (error) {
    throw httpErrors.BadRequest("Failed to create content: " + error.message);
  }
};

const getContentsByChapterId = async (chapterId) => {
  try {
    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      throw httpErrors.NotFound("Chapter not found");
    }

    const contents = await Content.find({ chapterId, isActive: true })
      .populate("createdBy", "username")
      .lean();
    return contents;
  } catch (error) {
    throw httpErrors.BadRequest("Failed to fetch contents: " + error.message);
  }
};

module.exports = {
  createContent,
  getContentsByChapterId,
};
