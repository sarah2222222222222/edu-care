const express = require("express");
const {
  createpost,
  getAllposts,
  getpost,
  updatepost,
  deletepost,
  uploadPostFiles,
  processPostUploads,
  addCommentToPost,
  updateComment,
  deleteComment,
  getPostsByClassId
} = require("../services/postService");

const authroute = require("../services/authService");

const router = express.Router();

// Routes for getting all posts and creating a post for a specific class
router.route("/").get(getPostsByClassId);

// Create post route that accepts classId as part of the URL (e.g., /post/:classId)
router
  .route("/:classId")
  .post(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    uploadPostFiles, // Handle image + file upload
    processPostUploads, // Resize image + save file
    createpost // Save post in DB
  );

// Missing individual post routes (GET, PUT, DELETE for a specific post)
router
  .route("/:postId")
  .get(getpost) // Get a specific post by postId
  .put(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    uploadPostFiles, // Handle image + file upload
    processPostUploads, // Resize image + save file
    updatepost // Update post
  )
  .delete(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    deletepost // Delete post
  );

// Routes for adding, updating, and deleting comments
router.route("/:postId/comment").post(authroute.protect, addCommentToPost);
router
  .route("/:postId/comment/:commentId")
  .put(
    authroute.protect,
    authroute.allowedTo("student", "teacher", "institution"),
    updateComment
  )
  .delete(
    authroute.protect,
    authroute.allowedTo("student", "teacher", "institution"),
    deleteComment
  );

module.exports = router;
