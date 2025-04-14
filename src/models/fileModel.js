import { pool } from "../config/db/index.js";

export const storeImage = async (
  name,
  file_name,
  ext,
  file_path,

  file_id
) => {
  const query = `
    INSERT INTO images (name, file_name, ext, file_path, file_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [name, file_name, ext, file_path, file_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the inserted row
  } catch (error) {
    console.error("Error storing image:", error);
    return null;
  }
};
export const getImageList = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM images ORDER BY created_at DESC"
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching image list:", error);
    return null;
  }
};
export const deleteImage = async (id) => {
  try {
    const query = `DELETE FROM images WHERE id = $1 RETURNING *`;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the deleted image info
  } catch (error) {
    console.error("Error deleting image:", error.message);
    return null;
  }
};
export const updateImage = async (id, name) => {
  try {
    const result = await pool.query(
      `UPDATE images SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error updating display name:", error);
    return null;
  }
};
