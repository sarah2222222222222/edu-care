const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");
const ClassModel = require("../models/classModel");
const postModel = require("../models/postModel");
const sharp = require("sharp");
const path = require("path");

const fs = require("fs");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const { uploadMixedFiles } = require("../middlewares/uploudImageMiddlewares");
// Middleware for uploading both image and doc
exports.uploadPostFiles = uploadMixedFiles([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Image and file processing
// Image and file processing
exports.processPostUploads = asyncHandler(async (req, res, next) => {
  // Process image if it exists
  if (req.files && req.files.image && req.files.image[0]) {
    const imageFile = req.files.image[0];
    const imageName = `post-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(imageFile.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/${imageName}`);

    req.body.image = imageName; // Save the image name to the body
  }

  // Process document file if it exists
  if (req.files && req.files.file && req.files.file[0]) {
    const docFile = req.files.file[0];
    const fileExt = path.extname(docFile.originalname);
    const docName = `post-${uuidv4()}-${Date.now()}${fileExt}`;
    const docPath = path.join("uploads", docName);

    fs.writeFileSync(docPath, docFile.buffer); // Save the document file
    req.body.file = docName; // Save the file name to the body
  }

  next(); // Move on to the next middleware
});
exports.getAllposts = factory.getMany(postModel);
exports.getpost = factory.getOne(postModel);
exports.createpost = factory.createOne(postModel);
exports.updatepost = factory.updateOne(postModel);
exports.deletepost = factory.deleteOne(postModel);


exports.addCommentToPost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { postId } = req.params;
  const { text } = req.body;

  // Check if the postId is valid
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(new ApiError("Invalid Post ID", 400));
  }

  // Validate comment text
  if (!text || text.trim().length === 0) {
    return next(new ApiError("Comment text is required", 400));
  }

  // Find post
  const post = await postModel.findById(postId);
  console.log("Found Post:", post); // Log to verify the post

  if (!post) {
    return next(new ApiError("Post not found", 404));
  }

  // Ensure the comments array exists
  if (!post.comments) {
    post.comments = [];
  }

  // Add comment to post
  post.comments.push({
    user: userId,
    text: text,
  });

  await post.save();

  res.status(200).json({
    message: "Comment added successfully",
    data: post.comments,
  });
});

// Update Comment
exports.updateComment = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { postId, commentId } = req.params;
  const { text } = req.body;

  // Check if the postId and commentId are valid
  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    return next(new ApiError("Invalid Post or Comment ID", 400));
  }

  // Validate comment text
  if (!text || text.trim().length === 0) {
    return next(new ApiError("Comment text is required", 400));
  }

  // Find post
  const post = await postModel.findById(postId);
  if (!post) {
    return next(new ApiError("Post not found", 404));
  }

  // Find the comment to update
  const comment = post.comments.id(commentId);
  if (!comment) {
    return next(new ApiError("Comment not found", 404));
  }

  // Check if the user is the owner of the comment
  if (!comment.user.equals(userId)) {
    return next(
      new ApiError("You are not authorized to update this comment", 403)
    );
  }

  // Update the comment text
  comment.text = text;

  await post.save();

  res.status(200).json({
    message: "Comment updated successfully",
    data: comment,
  });
});

// Delete Comment
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { postId, commentId } = req.params;

  // Check if the postId and commentId are valid
  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    return next(new ApiError("Invalid Post or Comment ID", 400));
  }

  // Find post
  const post = await postModel.findById(postId);
  if (!post) {
    return next(new ApiError("Post not found", 404));
  }

  // Find the comment to delete
  const comment = post.comments.id(commentId);
  if (!comment) {
    return next(new ApiError("Comment not found", 404));
  }

  // Check if the user is the owner of the comment
  if (!comment.user.equals(userId)) {
    return next(
      new ApiError("You are not authorized to delete this comment", 403)
    );
  }

  if (comment) {
    comment.deletedAt = Date.now(); // Mark the comment as soft-deleted
    await post.save();
  }

  await post.save();

  res.status(200).json({
    message: "Comment deleted successfully",
  });
});
// Assuming you are using Mongoose with MongoDB
exports.getPostsByClassId = async (req, res, next) => {
  const { classId } = req.query; // Get the classId from the query string
  
  if (!classId) {
    return res.status(400).json({ message: "Class ID is required" });
  }

  try {
    // Fetch posts by classId, ensuring posts are not marked as deleted
    const posts = await postModel.find({ class: classId, isDeleted: false }).lean();
    
    console.log("Posts found:", posts);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this class." });
    }

    // Respond with the posts data
    return res.status(200).json({ data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Server error while fetching posts" });
  }
};