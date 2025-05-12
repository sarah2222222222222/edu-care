const mongoose = require("mongoose");
const Course = require("./courseModel"); // Import the Course model

const favSchema = new mongoose.Schema(
  {
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-populate courses with price, title, and description
function autoPopulateCourses(next) {
  this.populate({
    path: "course",
    select: "price title description",
  });
  next();
}

favSchema.pre("find", autoPopulateCourses);
favSchema.pre("findOne", autoPopulateCourses);
favSchema.pre("findOneAndUpdate", autoPopulateCourses);
favSchema.pre("findById", autoPopulateCourses);

module.exports = mongoose.model("Fav", favSchema);
