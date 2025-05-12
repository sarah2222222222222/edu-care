const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { v4: uuidv4 } = require("uuid");

const submitModel = require("../models/SubmitModel");
const sharp = require("sharp");
const path = require("path");

const fs = require("fs");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const { uploadMixedFiles } = require("../middlewares/uploudImageMiddlewares");
// Middleware for uploading both image and doc
exports.uploadPostFiles = uploadMixedFiles([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Image and file processing
// Image and file processing
exports.processPostUploads = asyncHandler(async (req, res, next) => {
  // Process image if it exists
  if (req.files && req.files.image && req.files.image[0]) {
    const imageFile = req.files.image[0];
    const imageName = `post-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(imageFile.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/${imageName}`);

    req.body.image = imageName; // Save the image name to the body
  }

  // Process document file if it exists
  if (req.files && req.files.file && req.files.file[0]) {
    const docFile = req.files.file[0];
    const fileExt = path.extname(docFile.originalname);
    const docName = `post-${uuidv4()}-${Date.now()}${fileExt}`;
    const docPath = path.join("uploads", docName);

    fs.writeFileSync(docPath, docFile.buffer); // Save the document file
    req.body.file = docName; // Save the file name to the body
  }

  next(); // Move on to the next middleware
});
exports.getAllSubmit = factory.getMany(submitModel);
exports.getSubmit = factory.getOne(submitModel);
exports.createSubmit = factory.createOne(submitModel);
exports.updateSubmit = factory.updateOne(submitModel);
exports.deleteSubmit = factory.deleteOne(submitModel);
