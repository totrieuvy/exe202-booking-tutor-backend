const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: [true, "Chapter ID is required!"],
    },
    contentDescription: {
      type: String,
      enum: ["text", "video", "image", "audio", "document"],
      required: [true, "Content type is required!"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Creator ID is required!"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);
