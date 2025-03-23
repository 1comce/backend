import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as Video from "../models/videoModel.js";
import { encodeHLSWithMultipleVideoStreams } from "../utils/ffmpeg.js";
import { promisePool } from "../utils/promisePool.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
const processingVideos = new Set();
export const videoConvert = async (req, res) => {
  const { file_path } = req.query;
  if (!file_path) return res.status(400).send("No file path");
  try {
    const result = await encodeHLSWithMultipleVideoStreams(
      uploadDir + "/" + file_path
    );
    if (!result) return res.status(400).send("convert error");
    return res.status(200).send("convert success");
  } catch (error) {
    return res.status(500).send("Catch convert error");
  }
};
export const videoDelete = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Invalid request");
  }
  try {
    const result = await Video.deleteVideo(id);
    if (!result) {
      return res.status(500).send("Delete video failed");
    }
    res.status(204).send("Video deleted successfully");
  } catch (error) {
    console.log("Error deleting video:", error);
    res.status(500).send("Error deleting video");
  }
};
export const videoStore = async (req, res) => {
  const { title, description, url } = req.body;
  if (!title || !description || !url) {
    return res.status(400).send("Invalid request");
  }
  try {
    const result = await Video.storeVideo(title, description, url);
    if (!result) {
      return res.status(500).send("Store video failed");
    }
    res.status(201).json(rows[0]);
  } catch (error) {
    console.log("Error storing video:", error);
    res.status(500).send("Error storing video");
  }
};
export const videoUpload = async (req, res) => {
  // const file = Buffer.from(req.file.buffer);
  // const file = fs.readFileSync(
  //   file_path + `/tiny_wild_bird_searching_for_food_in_nature_6892037.mp4`
  // );
  // console.log("req.body", req.body);
  if (!req.body) {
    return res.status(400).send("Invalid request");
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
  const result = await response.json();
  console.log("file", result.result.document.file_id);
  return res.status(200).json({ file_id: result.result.document.file_id });
};
export const videoDownload = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Invalid request");
  }
  if (processingVideos.has(id)) {
    return res
      .status(400)
      .send("This video is currently being processed. Please wait.");
  }
  try {
    processingVideos.add(id);
    const response = await getbatch(id);
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
        processingVideos.delete(id);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const getFile = async (file_id) => {
  try {
    // Get the file information from Telegram API
    const response = await fetch(
      `${process.env.TELEGRAM_API_URL}${process.env.BOT_TOKEN}/getFile?file_id=${file_id}`
    );
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.log(`Error processing file with id ${file_id}:`, error);
  }
};
const getbatch = async (id, filedir = uploadDir) => {
  try {
    // Fetch all rows from the database
    const row = await Video.getVideo(id);
    const file_ids = row.url.mp4;
    const finalDir = filedir + `/${row.title}.mp4`;
    const promises = file_ids.map((file_id) => {
      return getFile(file_id);
    });
    try {
      const results = await promisePool(promises);
      for (const result of results) {
        const fileResponse = await fetch(
          `${process.env.TELEGRAM_API_FILE_URL}${process.env.BOT_TOKEN}/${result.file_path}`
        );
        let buffer = await fileResponse.bytes();
        fs.appendFileSync(finalDir, buffer);
        console.log("File append success file id: ", result.file_id);
        buffer = null;
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
