import express from "express";
import * as fileController from "../controllers/fileController.js";
import { uploadDisk } from "../middleware/multerHandler.js";
const router = express.Router();
router.post(
  "/imageUpload",
  uploadDisk.single("image"),
  fileController.imageUpload
);
router.get("/images", fileController.getImages);
router.delete("/images", fileController.deleteImage);
router.put("/images", fileController.updateImage);
export default router;
