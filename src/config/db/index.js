const { Pool } = require("pg");
const mongoose = require("mongoose");
// Create a new pool instance for connecting to the PostgreSQL database
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function connect() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.iyo0i.mongodb.net/nextjs?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("Connect to mongodb successfully!");
  } catch (error) {
    console.log("Connect to mongodb failure!: " + error);
  }
}
module.exports = { pool, connect };
