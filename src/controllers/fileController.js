import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PUBLIC_DIR, IMAGES_DIR } from "../utils/paths.js";
import { uploadFileToTelegram } from "../services/telegramServices.js";
import * as File from "../models/fileModel.js";
import createHttpError from "http-errors";
import { responeHandler } from "../handlers/responseHandlers.js";
export const imageUpload = async (req, res, next) => {
  const file = req.file;
  try {
    if (!file) {
      throw createHttpError(400, "Invalid request");
    }
    const relativePath = path
      .relative(IMAGES_DIR, file.path)
      .replace(/\\/g, "/");
    const response = await uploadFileToTelegram(file.path);
    const file_id = response.file_id;
    if (!file_id) {
      await fs.unlink(file.path);
      throw createHttpError(404, "Not found");
    }
    const ext = path.extname(file.originalname); // e.g. .png
    const baseName = path.basename(file.originalname, ext); // remove ext
    const result = await File.storeImage(
      baseName,
      relativePath,
      ext,
      "/images/" + relativePath,
      file_id
    );
    return responeHandler(res, 200, "store image success", result);
  } catch (error) {
    next(error);
  }
};
export const getImages = async (req, res, next) => {
  try {
    const result = await File.getImageList();
    if (!result) throw createHttpError(404, "Not Found");
    return responeHandler(res, 200, "found list", result);
  } catch (error) {
    next(error);
  }
};
export const deleteImage = async (req, res, next) => {
  const { id } = req.query;
  try {
    if (!id) throw createHttpError(400, "Invalid request");
    const result = await File.deleteImage(id);
    if (!result) throw createHttpError(404, "Not Found");
    await fs.unlink(path.join(IMAGES_DIR, result.file_name));
    return responeHandler(res, 204);
  } catch (error) {
    next(error);
  }
};
export const updateImage = async (req, res, next) => {
  const { id } = req.query;
  const { name } = req.body;
  try {
    if (!id || !name) throw createHttpError(400, "Invalid request");
    const result = await File.updateImage(id, name);
    if (!result) throw createHttpError(404, "Not found");
    return responeHandler(res, 202);
  } catch (error) {
    next(error);
  }
};
