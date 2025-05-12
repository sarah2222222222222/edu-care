const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");
const courseModel = require("../models/courseModel");
const userModel = require("../models/userModel");
const sharp = require("sharp");
const path = require("path");

const fs = require("fs");
const ApiError = require("../utils/ApiError")
const mongoose = require("mongoose");
const { uploadMixedFiles } = require("../middlewares/uploudImageMiddlewares");
// Middleware for uploading both image and doc
exports.uploadPostFiles = uploadMixedFiles([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Image and file processing
exports.processPostUploads = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.image && req.files.image[0]) {
    const imageFile = req.files.image[0];
    const imageName = `image-${uuidv4()}-${Date.now()}.jpeg`; // Name the file uniquely

    const outputPath = path.join("uploads", imageName); // Define the path to save the file

    // Process and save the image using sharp
    await sharp(imageFile.buffer)
      .resize(800, 700) // Resize image to 600x600
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    // Store the image path (relative path to the uploaded image) in the body
    req.body.image = imageName;
  }
  next();
});

exports.getAllCourses = factory.getMany(courseModel);
exports.getCourse = factory.getOne(courseModel);
exports.createCourse = factory.createOne(courseModel);
exports.updateCourse = factory.updateOne(courseModel);
exports.deleteCourse = factory.deleteOne(courseModel);

