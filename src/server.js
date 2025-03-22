const express = require("express");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const { pool, connect } = require("./config/db");
const app = express();
const route = require("./routes");
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.raw({ type: "application/octet-stream", limit: "20mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
const port = 5000;
app.use("/static", express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/setup", async (req, res) => {
  const createTable = `CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    url JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  try {
    await pool.query(createTable);
    res.send("Setup complete");
  } catch (err) {
    console.error("Error setting up table", err);
    res.status(500).send("Error setting up table");
  }
});
app.get("/test", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM videos");
    res.json(rows);
  } catch (error) {
    console.log(error);
  }
});
app.get("/insert-test", async (req, res) => {
  const insertQuery = `INSERT INTO videos (title, description, url) 
  VALUES 
    ('buggy', 'A buggy.', 
    '{"mp4": ["BQACAgUAAyEGAASOPfGbAAM4Z9lC7xVHNdQjVbKwzzSnut8D89wAArAXAAItfNBW5P74pToNR402BA", 
      "BQACAgUAAyEGAASOPfGbAAM6Z9lC9LlVN3b1uIJW5A3LvUtrCXQAArIXAAItfNBWHDcgYhbjW1U2BA", 
      "BQACAgUAAyEGAASOPfGbAAM7Z9lC-PZl4B8HqCg48c6IYcRl92YAArMXAAItfNBWGhPCCcjsuDM2BA", 
      "BQACAgUAAyEGAASOPfGbAAM8Z9lC-igoj3s8lhuKtpewWZyNdf8AArQXAAItfNBWcnBvH0yApIE2BA"]}')`;

  try {
    await pool.query(insertQuery);
    res.send("Insert successful");
  } catch (err) {
    console.error("Error inserting data", err);
    res.status(500).send("Error inserting data");
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  route(app);
  connect();
});
