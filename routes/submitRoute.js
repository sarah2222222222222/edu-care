const express = require("express");
const {
getAllSubmit,
getSubmit,
createSubmit,       
uploadPostFiles,
processPostUploads,
updateSubmit,
deleteSubmit,
updateGradeAndFeedback

} = require("../services/SubmitService");
const authroute = require("../services/authService");
const router = express.Router();

// Routes
router
  .route("/")
  .get(getAllSubmit) // GET /courses
  .post(
    authroute.protect,
    authroute.allowedTo("teacher", "institution" , "student"),
    uploadPostFiles,
processPostUploads,
    createSubmit
  ); // POST /courses

// Missing individual course routes
router
  .route("/:id")
  .get(getSubmit) // GET /courses/:id
  .put(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
   
    updateSubmit
  ) // PUT /courses/:id
  .delete(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    deleteSubmit
  ); // DELETE /courses/:id

module.exports = router;
