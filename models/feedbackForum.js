const mongoose = require("mongoose");

const feedbackForumSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User ID is required!"],
    },
    forumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: [true, "Forum ID is required!"],
    },
    reply: {
      type: String,
      required: [true, "Reply is required!"],
    },
  },
  {
    timestamps: true,
  }
);

const FeedbackForum = mongoose.model("FeedbackForum", feedbackForumSchema);
module.exports = FeedbackForum;
