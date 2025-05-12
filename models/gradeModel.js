const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submit",
      required: [true, "Grade must belong to a submit"],
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0, // Default should be a valid number, 0 is a good choice.
    },
    feedback: {
      type: String,
      default: "No feedback provided", // A meaningful default feedback.
    },
  },
  { timestamps: true }
);

// Auto-populate student fields with selected info (firstName and optionally lastName)
gradeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "student",
    select: "firstName lastName", // You can add other fields if needed
  });
  next();
});

module.exports = mongoose.model("Grade", gradeSchema);
