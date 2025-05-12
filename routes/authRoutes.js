const express = require("express");
const {
  signupValidator,
  loginInValidator,
} = require("../utils/validators/authVaildator");
const multer = require("multer");
const  {multerUpload}  = require ("../middlewares/uploadImage.middleware");
// Assuming you have a function named 'getCategories' in your services
const {
  signUp,
  logIn,
  forgotPassword,
  virfyPassResetCode,
  resetPassword,
  protect,
  requestPasswordChange,
  confirmPasswordChange
} = require("../services/authService");

const router = express.Router();
const upload = multer(); // memory storage
// Routes

router.route("/signup").post( multerUpload().single("profileImg"),signupValidator, signUp);
router.route("/login").post( upload.none(), loginInValidator, logIn);
router.route("/forgetPassword").post(forgotPassword);

router.route("/virfiyRestPass").post(virfyPassResetCode);
router.route("/resetPassword").patch(resetPassword);


router.put('/requestPasswordChange', protect, requestPasswordChange);
router.get('/confirmPasswordChange/:token', confirmPasswordChange);


module.exports = router;
