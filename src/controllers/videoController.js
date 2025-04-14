import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as Video from "../models/videoModel.js";
import { encodeHLSWithMultipleVideoStreams } from "../utils/ffmpeg.js";
import { promisePool } from "../utils/promisepool.js";
import {
  getFilePath,
  downloadFileFromTelegram,
  downloadFilePath,
  uploadFileToTelegram,
} from "../services/telegramServices.js";
import createHttpError from "http-errors";
import { responeHandler } from "../handlers/responseHandlers.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
const processingVideos = new Set();
export const getShow = async (req, res, next) => {
  const { id } = req.query;
  try {
    if (!id) throw createHttpError(400, "Invalid request");
    const result = await Video.getShow(id);
    if (!result) throw createHttpError(404, "Not found");
    return responeHandler(res, 200, "Get show success", result);
  } catch (error) {
    next(error);
  }
};
export const addShow = async (req, res, next) => {
  const { title, description } = req.body;
  console.log(req.body);
  try {
    if (!title || !description) throw createHttpError(400, "Invalid request");
    const result = await Video.addShow(title, description);
    if (!result) next(err);
    console.log(result);
    return responeHandler(res, 201, "Created");
  } catch (error) {
    next(error);
  }
};
export const uploadImage = async (req, res, next) => {
  const { file } = req;
  try {
    if (!file) throw createHttpError(400, "Invalid request");
    const filePath = path.join(uploadDir, file.filename);
    return responeHandler(res, 200, "Upload success", {
      file_path: filePath,
    });
  } catch (error) {
    next(error);
  }
};
export const videoPlayListLink = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) throw createHttpError(400, "Invalid request");
    const data = await Video.getVideo(id);
    const playlist = data.files.playlist;
    if (!playlist) throw createHttpError(404, "Not found");
    return responeHandler(200, "play list found", {
      file_path: uploadDir + playlist.file_path,
    });
  } catch (error) {
    next(error);
  }
};
export const videoConvert = async (req, res, next) => {
  const { id } = req.query;
  try {
    // if (!id) return res.status(400).send("No file path");
    // const inputPath = await getbatch(id);
    // if (!inputPath) return res.status(400).send("Can't get input path");
    // const result = await encodeHLSWithMultipleVideoStreams(inputPath);
    const result = await encodeHLSWithMultipleVideoStreams(
      path.join(
        uploadDir,
        "tiny_wild_bird_searching_for_food_in_nature_6892037.mp4"
      )
    );

    if (!result) return res.status(400).send("Can't convert video");
    return responeHandler(200, "Convert success");
  } catch (error) {
    next(error);
  }
};
export const playListStore = async (req, res, next) => {};
export const videoDelete = async (req, res, next) => {
  const { id } = req.query;
  try {
    if (!id) {
      throw createHttpError(400, "Invalid request");
    }
    const result = await Video.deleteVideo(id);
    if (!result) {
      throw createHttpError(404, "Not found");
    }
    return responeHandler(res, 200, "delete success", result);
  } catch (error) {
    console.log("Error deleting video:", error);
    next(error);
  }
};
export const videoStore = async (req, res, next) => {
  const { title, description, files } = req.body;
  try {
    if (!title || !description || !files) {
      throw createHttpError(400, "Invalid request");
    }
    const result = await Video.storeVideo(title, description, files);
    if (!result) {
      throw createHttpError(404, "Not found");
    }
    return responeHandler(res, 201, "store success", result);
  } catch (error) {
    console.log("Error storing video:", error);
    next(error);
  }
};
export const videoUpload = async (req, res, next) => {
  // const file = Buffer.from(req.file.buffer);
  // const file = fs.readFileSync(
  //   file_path + `/tiny_wild_bird_searching_for_food_in_nature_6892037.mp4`
  // );
  // console.log("req.body", req.body);
  try {
    if (!req.body) {
      throw createHttpError(400, "Invalid request");
    }
    const data = new Blob([req.body]);
    const form = new FormData();
    form.append("document", data);
    const response = await fetch(
      `${process.env.TELEGRAM_API_URL}${process.env.BOT_TOKEN}/sendDocument?chat_id=${process.env.CHAT_ID}`,
      {
        method: "POST",
        body: form,
      }
    );

    if (!response.ok) {
      throw createHttpError(429, "Too many request");
    }
    const result = await response.json();
    return responeHandler(res, 200, "upload success", {
      chat_id: result.result.chat.id,
      message_id: result.result.message_id,
      file_id: result.result.document.file_id,
    });
  } catch (error) {
    next(error);
  }
};
export const videoDownload = async (req, res, next) => {
  const { id } = req.query;
  try {
    if (!id) {
      throw createHttpError(400, "Invalid request");
    }
    if (processingVideos.has(id)) {
      throw createHttpError(409, "Conflict");
    }
    processingVideos.add(id);
    const response = await getbatch(id);
    if (!response) throw createHttpError(404, "Not Found");
    res.download(response, (err) => {
      if (err) {
        console.log("Error during file download:", err);
      } else {
        // After download is complete, delete the file
        fs.unlink(response, (err) => {
          if (err) {
            console.log("Error deleting file:", err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }
    });
  } catch (error) {
    next(error);
  } finally {
    processingVideos.delete(id);
  }
};
const getbatch = async (id, filedir = uploadDir) => {
  try {
    // Fetch all rows from the database
    const row = await Video.getVideo(id);
    const file_ids = row.files.movie.chunks;
    const finalDir = path.join(
      filedir,
      `${row.files.movie.file_name.toString().trim()}`,
      `${row.files.movie.file_name.toString().trim()}.${row.files.movie.file_ext
        .toString()
        .trim()}`
    );
    const parentDir = path.join(finalDir, "..");
    const fileExists = fs.existsSync(finalDir);
    if (fileExists) {
      return finalDir;
    } else fs.mkdirSync(parentDir, { recursive: true });
    const promises = file_ids.map((file_id) => {
      return getFilePath(file_id);
    });
    try {
      const results = await promisePool(promises, 100);
      for (const result of results) {
        await downloadFilePath(result, finalDir);
      }
    } catch (error) {
      console.log(`Error processing:`, error);
      fs.unlink(finalDir, (err) => {
        if (err) {
          console.log("Error deleting file in error catch:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
      return null;
    }

    return finalDir;
  } catch (error) {
    console.log("Error fetching rows from the database:", error);
  }
};
export const test = async (req, res, next) => {
  try {
    const structure = await buildHlsStructure(
      path.join(uploadDir, "master.m3u8")
    );

    console.log(structure);
    await downloadHls(structure, uploadDir + "/test");
    res.json(structure);
  } catch (error) {
    next(error);
  }
};
function getPathsFromM3U8(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const paths = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      // This captures segment files like seg-1.m4s
      paths.push(trimmedLine);
    } else if (trimmedLine.startsWith("#EXT-X-MAP:URI=")) {
      // Extract the URI from #EXT-X-MAP:URI="init.mp4"
      const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
      if (uriMatch) {
        paths.push(uriMatch[1]); // uriMatch[1] is "init.mp4"
      }
    }
  }

  return paths;
}
// async function addFileIdForM3U8(m3u8FilePath, segmentPath, fileId) {
//   const content = fs.readFileSync(m3u8FilePath, "utf-8");
//   const lines = content.split("\n");
//   const newLines = [];

//   for (const line of lines) {
//     if (line.trim() === segmentPath) {
//       newLines.push(`#file_id:${fileId}`);
//     }
//     newLines.push(line);
//   }

//   fs.writeFileSync(m3u8FilePath, newLines.join("\n"), "utf-8");
// }
async function addFileIdSegments(m3u8FilePath, segmentStructures) {
  // Read the entire file content once
  const content = fs.readFileSync(m3u8FilePath, "utf-8");
  const lines = content.split("\n");
  const newLines = [];
  // Process all segments and update the necessary lines
  for (const line of lines) {
    if (!line.startsWith("#")) {
      const matchingSegment = segmentStructures.find(
        (segment) => line.trim() === segment.file_name.trim()
      );
      if (matchingSegment) {
        newLines.push(`#file_id: ${matchingSegment.file_id}`); // Add the file_id comment
      }
    }
    newLines.push(line);
  }
  fs.writeFileSync(m3u8FilePath, newLines.join("\n"), "utf-8");
}
async function buildHlsStructure(currentFilePath, baseDir = uploadDir) {
  const fileName = path.basename(currentFilePath);
  const relativePath = path
    .relative(baseDir, currentFilePath)
    .replace(/\\/g, "/");
  let fileId = null;
  if (!fileName.endsWith(".m3u8")) {
    const result = await uploadFileToTelegram(currentFilePath);
    fileId = result.file_id;
    if (!fileId) {
      console.error(`Không thể upload ${fileName}`);
      return null;
    }
  }
  const structure = {
    file_name: fileName,
    file_path: `/${relativePath}`,
    file_id: fileId,
  };
  // Nếu là file .m3u8, đọc nội dung và xử lý tiếp
  if (fileName.endsWith(".m3u8")) {
    const paths = getPathsFromM3U8(currentFilePath);
    const segmentStructures = [];
    for (const p of paths) {
      const fullPath = path.join(path.dirname(currentFilePath), p);
      const childStructure = await buildHlsStructure(fullPath);
      if (childStructure) {
        if (p.endsWith(".m3u8")) {
          if (!structure.child_list) structure.child_list = [];
          structure.child_list.push(childStructure);
          // await addFileIdComment(currentFilePath, p, childStructure.file_id);
        } else if (p.endsWith(".mp4")) {
          if (!structure.init_file) structure.init_file = childStructure;
          // structure.init_file.push(childStructure);
        } else {
          // Nếu là segment (.ts, .m4s, etc.), thêm vào segments
          // if (!structure.segments) structure.segments = [];
          // structure.segments.push(childStructure);
          segmentStructures.push(childStructure);
          // await addFileIdComment(currentFilePath, p, childStructure.file_id);
        }
      }
    }
    if (segmentStructures.length > 0)
      await addFileIdSegments(currentFilePath, segmentStructures);
    const result = await uploadFileToTelegram(currentFilePath);
    const fileId = result.file_id;
    if (!fileId) {
      console.error(`Không thể upload ${fileName}`);
      return null;
    }
    structure.file_id = fileId;
  }
  return structure;
}
async function downloadHls(structure, outputDir = uploadDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const m3u8Path = path.join(outputDir, structure.file_path);
  const parentDir = path.join(m3u8Path, "..");
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  await downloadFileFromTelegram(structure.file_id, m3u8Path);
  if (structure.init_file) {
    const initPath = path.join(outputDir, structure.init_file.file_path);
    await downloadFileFromTelegram(structure.init_file.file_id, initPath);
  }
  const content = fs.readFileSync(m3u8Path, "utf-8");
  const lines = content.split("\n");
  let currentFileId = null;
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("#file_id:")) {
      currentFileId = trimmedLine.split(":")[1].trim();
    } else if (trimmedLine && !trimmedLine.startsWith("#")) {
      if (currentFileId) {
        const segmentPath = path.join(parentDir, trimmedLine);
        await downloadFileFromTelegram(currentFileId, segmentPath);
        currentFileId = null; // Reset sau khi tải
      }
    }
  }
  // Xử lý các file .m3u8 con (nếu có)
  if (structure.child_list && structure.child_list.length > 0) {
    for (const child of structure.child_list) {
      await downloadHls(child, outputDir);
    }
  }
}
