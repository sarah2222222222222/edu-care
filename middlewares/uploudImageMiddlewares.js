const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",          // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/pdf"              // .pdf
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images or document files are allowed", 400), false);
    }
  };

  return multer({ storage: multerStorage, fileFilter: multerFilter });
};

// For uploading a single file (image or doc)
exports.uploadSingleFile = (fieldName) => multerOptions().single(fieldName);

// For uploading multiple fields like image + doc
exports.uploadMixedFiles = (arrayOfFields) => multerOptions().fields(arrayOfFields);

