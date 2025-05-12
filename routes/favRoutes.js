const express = require("express");
const {
  createfav,
  getAllfav,
  getfav,
  updatefav,
  deletefav,
  getUserFav,


} = require("../services/favService");
const authroute = require("../services/authService");
const router = express.Router();

// Routes
router
  .route("/")
  /*   .get(getAllCourses) // GET /courses */
  .post(
    authroute.protect,
    authroute.allowedTo("teacher", "institution", "student"),
    createfav
  ); // POST /courses

router.get(
  "/:userId",
  authroute.protect,
  authroute.allowedTo("teacher", "institution", "student"),
  getUserFav
);

/* router.post(
  "/remove",
  authroute.protect,
  authroute.allowedTo("teacher", "institution", "student"),
  removeSingleCourseFromCart
); */
module.exports = router;
