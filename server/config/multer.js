import multer from "multer";
import path from "path";

// Multer configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB file size limit
  },
});

export default upload;
