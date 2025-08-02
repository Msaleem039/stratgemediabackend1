// utils/multer.js or middleware/multer.js

import multer from "multer";
import path from "path";

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded videos to /uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Accept only video files
const fileFilter = (req, file, cb) => {
  const allowedVideoExts = [".mp4", ".mov", ".avi", ".mkv"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedVideoExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files (mp4, mov, avi, mkv) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Max 100MB
});

// 👇 Export this one if you're uploading a single video
export const uploadSingleVideo = upload.single("videoFile");
