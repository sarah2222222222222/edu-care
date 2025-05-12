const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Post description is required"],
      minlength: [10, "Too short product description"],
    },
    file: {
      type: String,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null }, // Soft delete for comments
      },
    ],
    image: [String],
    class: {
      type: mongoose.Schema.ObjectId,
      ref: "Class",
      required: [true, "Post must belong to a Class"],
    },
    isDeleted: {
      type: Boolean,
      default: false, // Default value is false, meaning not deleted
    },
  },
  { timestamps: true }
);

// Pre-find hook to populate `class` and filter out soft-deleted posts
PostSchema.pre(/^find/, function (next) {
  // Only find posts that are not deleted
  this.find({ isDeleted: false });

  // Populate the class field
  this.populate({
    path: "class",
    select: "name",
  });

  next();
});

// Virtual to filter out soft-deleted comments
PostSchema.virtual("activeComments").get(function () {
  return this.comments.filter((comment) => !comment.deletedAt);
});





module.exports = mongoose.model("Post", PostSchema);
