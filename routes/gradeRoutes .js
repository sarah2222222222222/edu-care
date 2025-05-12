const express = require("express");
const {
  getAllGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,

} = require("../services/gradeService");
const authroute = require("../services/authService");
const router = express.Router();

// Routes
router
  .route("/")
  .get(getAllGrades) // GET /courses
  .post(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    createGrade
  ); // POST /courses

// Missing individual course routes
router
  .route("/:id")
  .get(getGrade) // GET /courses/:id
  .put(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
   
    updateGrade
  ) // PUT /courses/:id
  .delete(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    deleteGrade
  ); // DELETE /courses/:id

module.exports = router;
