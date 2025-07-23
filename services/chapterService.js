const mongoose = require("mongoose");
const httpErrors = require("http-errors");
const Chapter = require("../models/chapter");

const createChapter = async (chapterData) => {
  try {
    const chapter = new Chapter({
      title: chapterData.title,
      courseId: chapterData.courseId,
      createdBy: chapterData.createdBy,
    });
    await chapter.save();
    return chapter;
  } catch (error) {
    throw httpErrors.BadRequest("Failed to create chapter: " + error.message);
  }
};

const getChaptersByCourseId = async (courseId) => {
  try {
    const chapters = await Chapter.find({ courseId, isActive: true })
      .populate("createdBy", "username")
      .lean();
    return chapters;
  } catch (error) {
    throw httpErrors.BadRequest("Failed to fetch chapters: " + error.message);
  }
};

module.exports = {
  createChapter,
  getChaptersByCourseId,
};
