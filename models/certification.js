const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    experience: {
      type: Number,
      required: [true, "Experience is required!"],
      min: [0, "Experience cannot be negative!"],
    },
    name: {
      type: String,
      required: [true, "Certification name is required!"],
      unique: [true, "Certification name must be unique!"],
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
    },
    image: {
      type: [String], // Changed to array of strings
      required: [true, "At least one image URL is required!"],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.every((url) => typeof url === "string" && url.startsWith("http"));
        },
        message: "All image URLs must be valid strings starting with 'http'",
      },
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    isCanTeach: {
      type: Boolean,
      default: false,
    },
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Creator account ID is required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Certification = mongoose.model("Certification", certificationSchema);

module.exports = Certification;
