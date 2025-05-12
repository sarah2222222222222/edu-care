const express = require("express");
const router = express.Router();
const { createAssignment } = require("../services/generateassignmentService"); // Correct the import
const authroute = require("../services/authService");
// POST route to generate the assignment
router.post(
  "/",
  authroute.protect,
  authroute.allowedTo("teacher", "student"),
  createAssignment
);

module.exports = router;
