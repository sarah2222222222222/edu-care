const express = require("express");
const {
  getAllClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  joinClassRoom,
  addUserToClass,
  getDeletedClasses

} = require("../services/classService");
const authroute = require("../services/authService");
const router = express.Router();

// Routes
router
  .route("/")
  .get(getAllClasses) // GET /classes
  .post(authroute.protect, authroute.allowedTo("teacher", "institution"), createClass); // POST /classes
  router.post("/:classId/add/", authroute.protect, addUserToClass);
  
router.get('/deleted',getDeletedClasses);
// Missing individual class routes
router
  .route("/:id")
  .get(getClass) // GET /classes/:id
  .put(authroute.protect, authroute.allowedTo("teacher", "institution"),updateClass) // PUT /classes/:id
  .delete(authroute.protect, authroute.allowedTo("teacher", "institution"),deleteClass); // DELETE /classes/:id
router.route("/join").post(authroute.protect, authroute.allowedTo("teacher", "institution","student"), joinClassRoom);

module.exports = router;
