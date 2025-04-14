import multer from "multer";
import { IMAGES_DIR } from "../utils/paths.js";
import { hashMD5 } from "../utils/utils.js";
import path from "path";
const memoryStorage = multer.memoryStorage(); // Files will be stored in memory
export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for a file
    files: 5, // Allow up to 5 files
  },
});
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // e.g. .png
    const baseName = path.basename(file.originalname, ext); // remove ext
    const finalName = `${hashMD5(Date.now() + baseName)}${ext}`;
    cb(null, finalName);
  },
});
export const uploadDisk = multer({
  storage: diskStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
