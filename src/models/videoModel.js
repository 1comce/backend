import { pool } from "../config/db/index.js";

export const deleteVideo = async (id) => {
  try {
    const deleteQuery = `DELETE FROM videos WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(deleteQuery, [id]);
    return rows[0];
  } catch (error) {
    console.log("Error deleting video:", error);
    return null;
  }
};

export const getVideo = async (id) => {
  try {
    const { rows } = await pool.query("SELECT * FROM videos WHERE id = $1", [
      id,
    ]);
    return rows[0];
  } catch (error) {
    console.log("Error query video:", error);
    return null;
  }
};

export const storeVideo = async (title, description, url) => {
  const insertQuery = `INSERT INTO videos (title, description, url) VALUES ($1, $2, $3) RETURNING *`;
  try {
    const { rows } = await pool.query(insertQuery, [title, description, url]);
    return rows[0];
  } catch (error) {
    console.log("Error inserting video:", error);
    return null;
  }
};
