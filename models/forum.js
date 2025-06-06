const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User ID is required!"],
    },
    title: {
      type: String,
      required: [true, "Title is required!"],
    },
    content: {
      type: String,
      required: [true, "Content is required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Forum = mongoose.model("Forum", forumSchema);
module.exports = Forum;
