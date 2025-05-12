const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    interests: { type: [String], default: [] },
    image: [String],
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password is too short"],
    },
    passwordChangeAt: Date,
    passwordResetCode: String,
    passwordResetExpire: Date,
    passwordResetVervied: Boolean,
    passwordChangeToken: String,
    passwordChangeExpire: Date,
    pendingNewPassword: String,

    role: {
      type: String,
      enum: ["institution", "teacher", "student"],
      default: "student",
    },
    classes: [
      {
        classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Encrypt password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-find hook to populate the `classes` field
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "classes", // The field to populate (plural `classes` as per your schema)
    select: "name", // Only select the 'name' field from the populated Class model
  });
  next();
});

const User = mongoose.model("User", userSchema); // Correcting typo for mongoose model

module.exports = User;
