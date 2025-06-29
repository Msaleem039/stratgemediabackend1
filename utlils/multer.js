import multer from "multer";
import path from "path";

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".png", ".jpeg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
  }
};

// Multer instance for handling multiple images (Max: 5)
const upload = multer({
  storage,
  fileFilter,
  limits: { files: 5, fileSize: 5 * 1024 * 1024 }, // Max 5 files
});

export const uploadPropertyImages = upload.array("images", 5); // Max 5 images
export const uploadReviewImages = upload.array("images", 5); // Max 5 images for review
export const uploadSingleImage = upload.single("profileImage"); // single profile image