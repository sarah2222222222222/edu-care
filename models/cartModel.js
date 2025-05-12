const mongoose = require("mongoose");
const Course = require("./courseModel"); // Import the Course model

const cartSchema = new mongoose.Schema(
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
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-populate courses with price
function autoPopulateCourses(next) {
  this.populate({
    path: "course",
    select: "price title description ",

  });
  next();
}

cartSchema.pre("find", autoPopulateCourses);
cartSchema.pre("findOne", autoPopulateCourses);
cartSchema.pre("findOneAndUpdate", autoPopulateCourses);
cartSchema.pre("findById", autoPopulateCourses);

// Calculate totalAmount before saving
cartSchema.pre("save", async function (next) {
  try {
    const courses = await Course.find({ _id: { $in: this.course } }).select("price");
    this.totalAmount = courses.reduce((sum, c) => sum + (c.price || 0), 0);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Cart", cartSchema);
