const httpErrors = require("http-errors");
const db = require("../models/index");

const createFeedback = async ({ courseId, accountId, rating, comment }) => {
  try {
    // Validate inputs
    if (!courseId || !accountId || !rating || !comment) {
      throw httpErrors.BadRequest("All fields are required");
    }

    // Create new feedback using db.Feedback
    const feedback = new db.Feedback({
      courseId,
      accountId,
      rating,
      comment,
    });

    await feedback.save();
    return feedback;
  } catch (error) {
    if (error.name === "ValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    throw error;
  }
};

const getFeedbackByCourse = async (courseId) => {
  try {
    if (!courseId) {
      throw httpErrors.BadRequest("Course ID is required");
    }

    const feedbacks = await db.Feedback.find({ courseId })
      .populate("accountId", "fullName email avatar") // Populate specific account details
      .populate("courseId", "title") // Populate course details
      .sort({ createdAt: -1 }); // Sort by newest first

    return feedbacks;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createFeedback,
  getFeedbackByCourse,
};
