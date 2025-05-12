const mongoose = require("mongoose");

const SubmitSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["assignment", "quiz"],
    },
    description: {
      type: String,
      required: [true, "Submit description is required"],
      minlength: [10, "Too short product description"],
    },
    title: {
      type: String,
      required: [true, "Submit title is required"],
      minlength: [10, "Too short product title"],
    },
    file: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    customDate: {
      type: String,
      default: () =>
        new Date().toLocaleString("en-US", {
          timeZone: "Africa/Cairo",  // Egypt's time zone
          year: "numeric",
          month: "2-digit",   // <-- Changed from "long" to "2-digit"
          day: "2-digit",
          hour: "2-digit",    // Added to capture the current time as well
          minute: "2-digit",
          second: "2-digit",
        }),
    },

    grade: {
      type: Number,
      min: 0,
      max: 100,
      default: null // or 0, if that's your intended default score
    },
    feedback: {
      type: String,
      default: "No feedback yet" // or any default message you'd like
    },
  },
  { timestamps: true }
);


SubmitSchema.pre([/^find/, /^findOneAndUpdate/], function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName email",
  });
  next();
});

module.exports = mongoose.model("Submit", SubmitSchema);
