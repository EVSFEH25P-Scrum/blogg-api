import { pool } from "../config/database.mjs";

export async function createComment(content, postId, authorId) {
  const check = await pool.query("SELECT id FROM posts WHERE id = $1", [
    postId,
  ]);

  if (check.rowCount === 0) {
    throw new Error("No such post exists");
  }

  const result = await pool.query(
    "INSERT INTO comments (content, post_id, author_id) VALUES ($1, $2, $3) RETURNING *",
    [content, postId, authorId]
  );

  if (result.rowCount !== 1) {
    throw new Error("Failed to save comment");
  }
  // HEJ
  return result.rows[0];
}
