const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required!"],
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User ID is required!"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required!"],
      min: [1, "Rating must be at least 1!"],
      max: [5, "Rating must be at most 5!"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
