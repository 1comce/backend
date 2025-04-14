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

export const storeVideo = async (title, description, files) => {
  const insertQuery = `INSERT INTO videos (title, description, files) VALUES ($1, $2, $3) RETURNING *`;
  try {
    const { rows } = await pool.query(insertQuery, [title, description, files]);
    return rows[0];
  } catch (error) {
    console.log("Error inserting video:", error);
    return null;
  }
};

export const setPlaylistVideo = async (id, playlist) => {
  const query = `
    UPDATE videos
    SET files = jsonb_set(
      files,
      '{movie,playlist}', 
      $1::jsonb, 
      true -- This argument specifies that it should not overwrite the existing movie object, it just adds the new playlist
    )
    WHERE id = $2;
  `;

  const values = [playlist, id];

  try {
    const result = await pool.query(query, values);
    console.log("Playlist updated successfully:", result);
  } catch (error) {
    console.error("Error updating playlist:", error);
  }
};
const ITEMS_PER_PAGE = 20;
export const showFilter = (query, currentPage) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const insertQuery = `
    SELECT 
    movies.id,
    movies.title,
    movies.description,
    movies.poster_path,
    movies.backdrop_path,
    COALESCE(ARRAY_AGG(DISTINCT genres.name) FILTER (WHERE genres.name IS NOT NULL), '{}') AS genres,
    movies.release_date,
    movies.create_at,
    COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'id', episodes.id,
                'episode_number', episodes.episode_number,
                'raw', episodes.raw,
                'playlist', episodes.playlist
            )
        ) FILTER (WHERE episodes.id IS NOT NULL), '[]'
    ) AS episodes
    FROM movies
    LEFT JOIN LATERAL (
        SELECT name FROM genres WHERE id = ANY(movies.genre_ids)
    ) AS genres ON true
    LEFT JOIN episodes ON movies.id = episodes.show_id
    WHERE 
        movies.title ILIKE ${`%${query}%`} OR
        movies.description ILIKE ${`%${query}%`} OR
        movies.release_date::text ILIKE ${`%${query}%`} OR
        EXISTS (
            SELECT 1 FROM genres WHERE id = ANY(movies.genre_ids) AND name ILIKE ${`%${query}%`}
        )
    GROUP BY movies.id
    ORDER BY movies.release_date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};`;
};
export const addShow = async (title, description) => {
  const insertQuery = `INSERT INTO movies (title, description) VALUES ($1, $2) RETURNING *`;
  try {
    const { rows } = await pool.query(insertQuery, [title, description]);
    return rows[0];
  } catch (error) {
    console.log("Error inserting video:", error);
    return null;
  }
};
export const getShow = async (id) => {
  const query = `SELECT * FROM movies WHERE id = $1`;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  } catch {
    console.log("Error getting show:", error);
    return null;
  }
};
export const updateShow = async (id) => {};
