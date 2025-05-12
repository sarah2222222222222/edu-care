const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    unique: true,
    lowercase: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: [String],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Course must belong to a user"],
  },
  class :{
    type: mongoose.Schema.ObjectId,
    ref: "Class",
    required: [true, "Course must belong to a class"],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
