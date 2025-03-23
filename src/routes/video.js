import express from "express";
import * as videoController from "../controllers/videoController.js";
const router = express.Router();
router.post("/upload", videoController.videoUpload);
router.get("/download", videoController.videoDownload);
router.post("/store", videoController.videoStore);
router.delete("/delete", videoController.videoDelete);
router.get("/convert", videoController.videoConvert);
export default router;
