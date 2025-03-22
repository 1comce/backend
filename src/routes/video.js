const express = require("express");
const router = express.Router();
const videoController = require("../app/controllers/videoController");
router.post("/upload", videoController.upload);
router.get("/download", videoController.download);
router.post("/store", videoController.store);

module.exports = router;
