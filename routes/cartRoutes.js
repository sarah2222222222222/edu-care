const express = require("express");
const {
  addToCart,
  createcart,
  getUserCart,
  removeSingleCourseFromCart
} = require("../services/cartService");
const authroute = require("../services/authService");
const router = express.Router();

// Routes
router
  .route("/")
  /*   .get(getAllCourses) // GET /courses */
  .post(
    authroute.protect,
    authroute.allowedTo("teacher", "institution", "student"),
    createcart
  ); // POST /courses

router.get(
  "/:userId",
  authroute.protect,
  authroute.allowedTo("teacher", "institution", "student"),
  getUserCart
);

router.post(
  "/remove",
  authroute.protect,
  authroute.allowedTo("teacher", "institution", "student"),
  removeSingleCourseFromCart
);
module.exports = router;
