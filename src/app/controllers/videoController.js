const fs = require("fs");
const path = require("path");
const { pool } = require("../../config/db");
const { promisePool } = require("../../utils/promisepool");

const file_path = path.join(__dirname, "..", "..", "..", "public", "uploads");
const processingVideos = new Set();
const store = async (req, res) => {
  const { title, description, url } = req.body;
  if (!title || !description || !url) {
    return res.status(400).send("Invalid request");
  }
  try {
    const insertQuery = `INSERT INTO videos (title, description, url) VALUES ($1, $2, $3) RETURNING *`;
    const { rows } = await pool.query(insertQuery, [title, description, url]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.log("Error inserting data:", error);
    res.status(500).send("Error inserting data");
  }
};
const upload = async (req, res) => {
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
const download = async (req, res) => {
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
const getbatch = async (id) => {
  try {
    // Fetch all rows from the database
    const { rows } = await pool.query("SELECT * FROM videos WHERE id = $1", [
      id,
    ]);
    const file_ids = rows[0].url.mp4;
    const file = file_path + `/${rows[0].title}.mp4`;
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
        fs.appendFileSync(file, buffer);
        console.log("File append success file id: ", result.file_id);
        buffer = null;
      }
    } catch (error) {
      console.log(`Error processing:`, error);
      fs.unlink(file, (err) => {
        if (err) {
          console.log("Error deleting file in error catch:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
      return null;
    }

    return file;
  } catch (error) {
    console.log("Error fetching rows from the database:", error);
  }
};
module.exports = {
  upload,
  download,
  store,
};
