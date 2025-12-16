import { pool } from "../config/database.mjs";

export async function createUser(username, password) {
  const result = await pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at",
    [username, password]
  );

  if (result.rowCount !== 1) {
    throw new Error("Failed to insert user");
  }

  return result.rows[0];
}

export async function loginUser(username, password) {
  const result = await pool.query(
    "SELECT id, username, created_at FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (result.rowCount !== 1) {
    return null;
  }

  return result.rows[0];
}
