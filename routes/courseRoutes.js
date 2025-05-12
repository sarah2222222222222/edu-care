const express = require("express");
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
 
  uploadPostFiles,
  processPostUploads,
  
} = require("../services/courseService");
const authroute = require("../services/authService");
const router = express.Router();

// Routes
router
  .route("/")
  .get(getAllCourses) // GET /courses
  .post(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    uploadPostFiles,
    processPostUploads,
    createCourse
  ); // POST /courses

// Missing individual course routes
router
  .route("/:id")
  .get(getCourse) // GET /courses/:id
  .put(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    uploadPostFiles,
    processPostUploads,
    updateCourse
  ) // PUT /courses/:id
  .delete(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    deleteCourse
  ); // DELETE /courses/:id

module.exports = router;
