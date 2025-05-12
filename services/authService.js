const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

// Helper function to create JWT token
const createToken = (payload) => {
  return jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP_TIME,
  });
};

// User signup route and linking old orders

exports.signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if the email already exists in the system
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    // Generate token for the user
    const token = createToken(user._id);

    // Send the response with user data and token
    res.status(201).json({
      message: "User created successfully ",
      data: user,
      token,
    });
  } catch (error) {
    return next(new ApiError(`Error creating user: ${error.message}`, 500));
  }
});

// LogIn route
exports.logIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("email or password is incorrect", 401));
  }

  // Generate token
  const token = createToken(user._id);

  // Send the response with user data and token
  res.status(201).json({ data: user, token });
});

// Middleware to ensure the user is authenticated
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exists in headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in, please login to access this route",
        401
      )
    );
  }

  // 2- verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3- check if user associated with token exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("The user associated with this token does not exist", 401)
    );
  }

  // 4- check if password was changed after token was issued
  if (currentUser.passwordChangeAt) {
    const passwordChangeTimestamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10
    );
    if (passwordChangeTimestamp > decoded.iat) {
      return next(
        new ApiError("User recently changed password, please login again", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

// Authorization middleware for checking roles
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to access this route", 403)
      );
    }
    next();
  });

// Forgot password route for sending reset code to email
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`No user found for this email: ${req.body.email}`, 404)
    );
  }

  // Generate reset code and hash it
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash("sha256").update(resetCode).digest("hex");

  // Update user's reset code and expiry
  user.passwordResetCode = hash;
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // expires in 10 minutes
  user.passwordResetVervied = false; // Ensure spelling is correct here
  await user.save();

  // Send reset code via email
  const message = `Hi ${user.email},\nWe received a request to reset your password on your App Account.\nReset Code: ${resetCode}\nEnter this code to reset your password.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code is valid for 10 minutes",
      message,
    });

    // Response back to the user
    res.status(200).json({
      message:
        "Password reset code has been sent to your email. The code is valid for 10 minutes.",
    });
  } catch (error) {
    return next(
      new ApiError("Error sending reset email. Please try again later.", 500)
    );
  }
});
// virfiy password route for  reset code to email
exports.virfyPassResetCode = asyncHandler(async (req, res, next) => {
  //get user  based on rset code

  const hash = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hash,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("reset code is invialed or expired "));
  }

  //2- reset code valid
  user.passwordResetVervied = true;
  user.save();
  res.status(200).json({
    status: "Success",
  });
});

//reset password

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1-get user based on email
  const user = await User.findOne({ email: req.body.email });
  console.log(user);

  if (!user) {
    return next(
      new ApiError(`No user found for this email: ${req.body.email}`, 404)
    );
  }

  //2- check if code is  virfid
  if (!user.passwordResetVervied) {
    return next(new ApiError("reset code not virfy", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVervied = undefined;
  await user.save();

  //3- generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});


exports.requestPasswordChange = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ApiError("Both current and new passwords are required", 400));
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new ApiError("User not found", 404));

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return next(new ApiError("Current password is incorrect", 401));

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  user.passwordChangeToken = hashedToken;
  user.passwordChangeExpire = Date.now() + 10 * 60 * 1000;
  user.pendingNewPassword = await bcrypt.hash(newPassword, 6);
  await user.save();

  const confirmURL = `${req.protocol}://${req.get('host')}/api/v1/auth/confirmPasswordChange/${token}`;
  const message = `Hi ${user.firstName},\n\nClick below to confirm your password change:\n${confirmURL}\n\nThis link expires in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Confirm Your Password Change",
      message,
    });

    res.status(200).json({ message: 'Confirmation link sent to your email.' });
  } catch (err) {
    user.passwordChangeToken = undefined;
    user.passwordChangeExpire = undefined;
    user.pendingNewPassword = undefined;
    await user.save();

    return next(new ApiError("Failed to send email. Try again later.", 500));
  }
});






exports.confirmPasswordChange = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordChangeToken: hashedToken,
    passwordChangeExpire: { $gt: Date.now() },
  });

  if (!user || !user.pendingNewPassword) {
    return next(new ApiError('Invalid or expired token', 400));
  }

  // Finalize password change
  user.password = user.pendingNewPassword;
  user.passwordChangeToken = undefined;
  user.passwordChangeExpire = undefined;
  user.pendingNewPassword = undefined;
  await user.save();

  const newToken = createToken(user._id);

  res.status(200).json({ message: 'Password successfully changed', token: newToken });
});
