import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";

// Make sure the 'uploads' directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer setup
export const multerUpload = () => {
  const storage = diskStorage({
    // Define where to store the file
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // File is saved in the 'uploads/' directory
    },
    
    // Define the filename
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname); // Get file extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Unique part
      cb(null, file.fieldname + "-" + uniqueSuffix + ext); // The final filename
    },
  });

  // Configure multer to use the storage setup
  return multer({ storage: storage });
};
