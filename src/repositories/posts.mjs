import { pool } from "../config/database.mjs";

// Skapar ett nytt blogginlägg i databasen
// Tar emot title, content och author som parametrar
export async function createBlogPost(title, content, authorId) {
  // Kör en INSERT-query mot databasen
  // $1, $2, $3 är placeholders som ersätts av värdena i arrayen
  // Detta skyddar mot SQL-injection!
  // RETURNING * gör att vi får tillbaka den skapade raden
  const result = await pool.query(
    "INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *",
    [title, content, authorId]
  );

  // Kollar att exakt 1 rad skapades
  if (result.rowCount !== 1) {
    throw new Error("Failed to insert blogpost");
  }

  // Returnerar det skapade inlägget (inklusive autogenererat id)
  return result.rows[0];
}

// Hämtar alla blogginlägg från databasen
export async function getAllBlogPosts() {
  // SELECT * hämtar alla kolumner, FROM posts betyder från posts-tabellen
  const result = await pool.query(
    `SELECT 
      posts.id, 
      posts.title, 
      posts.content, 
      posts.created_at, 
      posts.likes,
      users.username,
      users.id AS author_id
    FROM posts LEFT JOIN users ON posts.author_id = users.id`
  );

  if (!result.rows) {
    throw new Error("Failed to get blogposts");
  }

  // Returnerar en array med alla inlägg
  return result.rows;
}

// Hämtar alla blogginlägg från databasen
export async function getBlogPostByAuthor(authorId) {
  const result = await pool.query(
    `SELECT 
      posts.id, 
      posts.title, 
      posts.content, 
      posts.created_at, 
      posts.likes,
      users.username,
      users.id AS author_id
    FROM posts LEFT JOIN users ON posts.author_id = users.id WHERE author_id = $1`,
    [authorId]
  );

  if (!result.rows) {
    throw new Error("Failed to get blogposts");
  }

  // Returnerar en array med alla inlägg
  return result.rows;
}

// Hämtar ett specifikt blogginlägg baserat på id
export async function getBlogPostById(postId) {
  // WHERE id = $1 filtrerar så vi bara får inlägget med rätt id
  const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
    postId,
  ]);

  // Om vi inte hittar någon rad, returnera null
  if (!result.rows || result.rowCount !== 1) {
    return null;
  }

  const comments = await pool.query(
    `SELECT
      comments.id,
      comments.content,
      comments.created_at,
      comments.likes,
      users.username,
      users.id AS author_id
    FROM comments LEFT JOIN users ON comments.author_id = users.id WHERE post_id = $1`,
    [postId]
  );

  const post = result.rows[0];
  post.comments = comments.rows;

  // Returnerar det första (och enda) inlägget
  return post;
}

// Söker efter blogginlägg vars titel innehåller en viss text
export async function getBlogPostsByTitle(title) {
  // LOWER() konverterar till gemener för case-insensitive sökning
  // LIKE med % före och efter söker efter texten var som helst i titeln
  // Exempel: "java" hittar "JavaScript tutorial" och "Learning Java"
  const result = await pool.query(
    "SELECT * FROM posts WHERE LOWER(title) LIKE $1",
    ["%" + title.toLowerCase() + "%"]
  );

  // Om inga resultat hittas, returnera tom array
  if (!result.rows) {
    return [];
  }

  return result.rows;
}

// Raderar ett blogginlägg baserat på id
export async function deleteBlogPostById(postId, authorId) {
  // DELETE tar bort raden från tabellen
  const result = await pool.query(
    "DELETE FROM posts WHERE id = $1 AND author_id = $2",
    [postId, authorId]
  );

  // Returnerar true om minst 1 rad raderades, annars false
  return result.rowCount > 0;
}

// Uppdaterar alla fält på ett blogginlägg
export async function updateBlogPostById(postId, authorId, title, content) {
  // UPDATE ändrar befintliga rader
  // SET anger vilka kolumner som ska uppdateras och till vilka värden
  const result = await pool.query(
    "UPDATE posts SET title = $1, content = $2 WHERE id = $3 AND author_id = $4",
    [title, content, postId, authorId]
  );

  // Returnerar true om minst 1 rad uppdaterades
  return result.rowCount > 0;
}

// Uppdaterar bara titeln på ett blogginlägg
export async function updateBlogPostTitleById(postId, authorId, title) {
  // Här uppdaterar vi bara title-kolumnen, resten förblir oförändrat
  const result = await pool.query(
    "UPDATE posts SET title = $1 WHERE id = $2 AND author_id = $3",
    [title, postId, authorId]
  );

  return result.rowCount > 0;
}

// Ökar likes-räknaren med 1 på ett blogginlägg
export async function likeBlogPostById(postId) {
  // likes = likes + 1 tar nuvarande värde och lägger till 1
  // Detta sker direkt i databasen, vilket är säkert för samtidiga anrop
  const result = await pool.query(
    "UPDATE posts SET likes = likes + 1 WHERE id = $1",
    [postId]
  );

  return result.rowCount > 0;
}

// Minskar likes-räknaren med 1 på ett blogginlägg
export async function dislikeBlogPostById(postId) {
  // likes = likes - 1 tar nuvarande värde och drar bort 1
  const result = await pool.query(
    "UPDATE posts SET likes = likes - 1 WHERE id = $1",
    [postId]
  );

  return result.rowCount > 0;
}
