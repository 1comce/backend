import multer from "multer";
const storage = multer.memoryStorage(); // Files will be stored in memory
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for a file
    files: 5, // Allow up to 5 files
  },
});
