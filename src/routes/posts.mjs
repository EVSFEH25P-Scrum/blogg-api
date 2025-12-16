import express from "express";
import { validateNumber, validateString } from "../utilities/validation.mjs";
import {
  createBlogPost,
  deleteBlogPostById,
  dislikeBlogPostById,
  getAllBlogPosts,
  getBlogPostByAuthor,
  getBlogPostById,
  getBlogPostsByTitle,
  likeBlogPostById,
  updateBlogPostById,
  updateBlogPostTitleById,
} from "../repositories/posts.mjs";
import { loginUser } from "../repositories/users.mjs";

// Skapar en router som vi kan definiera våra endpoints på
// En router är som en mini-app inom vår huvudapp
const router = express.Router();

// POST /api/blogs - Skapar ett nytt blogginlägg
// req (request) innehåller data från klienten
// res (response) används för att skicka tillbaka data till klienten
router.post("/blogs", async (req, res) => {
  const user = await loginUser(req.headers.username, req.headers.password);
  if (!user) {
    res.status(401).json({
      error: "The username or password is incorrect",
    });
    return;
  }

  // Först kollar vi att requesten har en body (JSON-data)
  if (!req.body) {
    res.status(400).json({
      error: "A JSON body must be included",
    });
    return;
  }

  // Plockar ut title och content från request body
  const title = req.body.title;
  const content = req.body.content;

  // Validerar att title är en sträng och inte undefined/null
  if (!validateString(title)) {
    res.status(400).json({
      error: "Title must be included and be a string",
    });
    return;
  }

  // Validerar content på samma sätt
  if (!validateString(content)) {
    res.status(400).json({
      error: "Content must be included and be a string",
    });
    return;
  }

  // Om allt är okej, försöker vi skapa inlägget i databasen
  try {
    const post = await createBlogPost(title, content, user.id);
    // Status 201 = Created (framgångsrikt skapat)
    res.status(201).json(post);
  } catch (error) {
    // Om något går fel, skriver vi ut felet och skickar tillbaka 500 (server error)
    console.log(error);
    res.status(500).json({ error: "An unexpected error occurred." });
    return;
  }
});

// GET /api/blogs - Hämtar alla blogginlägg
// Denna endpoint är enkel - vi hämtar alla posts och skickar tillbaka dem
router.get("/blogs", async (req, res) => {
  const posts = await getAllBlogPosts();
  res.json(posts); // Status 200 är default för res.json()
});

router.get("/blogs/self", async (req, res) => {
  const user = await loginUser(req.headers.username, req.headers.password);
  if (!user) {
    res.status(401).json({
      error: "The username or password is incorrect",
    });
    return;
  }

  const posts = await getBlogPostByAuthor(user.id);
  res.json(posts); // Status 200 är default för res.json()
});

// GET /api/blogs/search?title=sökord - Söker efter blogginlägg baserat på titel
// Query parameters kommer från URL:en (allt efter ?)
// Exempel: /api/blogs/search?title=javascript söker efter posts med "javascript" i titeln
router.get("/blogs/search", async (req, res) => {
  const titleSearch = req.query.title; // Hämtar "title" från query parameters

  if (!validateString(titleSearch)) {
    res.status(400).json({ error: "Title must be a string" });
    return;
  }

  // Söker i databasen efter posts som matchar titeln
  const posts = await getBlogPostsByTitle(titleSearch);
  res.json(posts);
});

// GET /api/blogs/:id - Hämtar ett specifikt blogginlägg med id
// :id är en route parameter som vi kan komma åt via req.params
// Exempel: /api/blogs/5 hämtar inlägget med id 5
router.get("/blogs/:id", async (req, res) => {
  // Konverterar id från string (URL) till nummer
  const postId = Number.parseInt(req.params.id);

  if (!validateNumber(postId)) {
    res.status(400).json({ error: "Post id must be a number" });
    return;
  }

  // Försöker hämta posten från databasen
  const post = await getBlogPostById(postId);

  // Om vi inte hittar något, skicka tillbaka 404 (Not Found)
  if (!post) {
    res
      .status(404)
      .json({ error: "A post with id '" + postId + "' does not exist" });
    return;
  }

  res.json(post);
});

// DELETE /api/blogs/:id - Raderar ett blogginlägg
// Tar bort inlägget helt från databasen
router.delete("/blogs/:id", async (req, res) => {
  const user = await loginUser(req.headers.username, req.headers.password);
  if (!user) {
    res.status(401).json({
      error: "The username or password is incorrect",
    });
    return;
  }

  const postId = Number.parseInt(req.params.id);

  if (!validateNumber(postId)) {
    res.status(400).json({ error: "Post id must be a number" });
    return;
  }

  // Försöker radera posten - får tillbaka true/false
  const deleted = await deleteBlogPostById(postId, user.id);

  // Om inlägget inte finns, returnera 404
  if (!deleted) {
    res
      .status(404)
      .json({ error: "A post with id '" + postId + "' does not exist" });
    return;
  }

  // Status 204 = No Content (framgångsrikt raderad, ingen data att skicka tillbaka)
  res.status(204).send();
});

// PUT /api/blogs/:id - Uppdaterar ett helt blogginlägg
// PUT används när vi vill uppdatera ALLA fält (title, content, author)
// Jämför med PATCH som bara uppdaterar vissa fält
router.put("/blogs/:id", async (req, res) => {
  const user = await loginUser(req.headers.username, req.headers.password);
  if (!user) {
    res.status(401).json({
      error: "The username or password is incorrect",
    });
    return;
  }

  const postId = Number.parseInt(req.params.id);

  if (!validateNumber(postId)) {
    res.status(400).json({ error: "Post id must be a number" });
    return;
  }

  // Hämtar alla fält som ska uppdateras
  const title = req.body.title;
  const content = req.body.content;

  // Validerar alla fält - alla måste finnas för PUT
  if (!validateString(title)) {
    res.status(400).json({
      error: "Title must be included and be a string",
    });
    return;
  }

  if (!validateString(content)) {
    res.status(400).json({
      error: "Content must be included and be a string",
    });
    return;
  }

  // Uppdaterar inlägget i databasen
  const updated = await updateBlogPostById(postId, user.id, title, content);
  if (!updated) {
    res
      .status(404)
      .json({ error: "A post with id '" + postId + "' does not exist" });
    return;
  }

  res.status(204).send();
});

// PATCH /api/blogs/:id/title - Uppdaterar bara titeln på ett inlägg
// PATCH används för partiella uppdateringar (bara vissa fält)
// I det här fallet uppdaterar vi bara title, resten förblir oförändrat
router.patch("/blogs/:id/title", async (req, res) => {
  const user = await loginUser(req.headers.username, req.headers.password);
  if (!user) {
    res.status(401).json({
      error: "The username or password is incorrect",
    });
    return;
  }

  const postId = Number.parseInt(req.params.id);

  if (!validateNumber(postId)) {
    res.status(400).json({ error: "Post id must be a number" });
    return;
  }

  const title = req.body.title;

  if (!validateString(title)) {
    res.status(400).json({
      error: "Title must be included and be a string",
    });
    return;
  }

  // Uppdaterar bara titeln, content och author förblir samma
  const updated = await updateBlogPostTitleById(postId, user.id, title);
  if (!updated) {
    res
      .status(404)
      .json({ error: "A post with id '" + postId + "' does not exist" });
    return;
  }

  res.status(204).send();
});

// PATCH /api/blogs/:id/like - Ökar likes med 1 på ett inlägg
// Ingen body behövs - vi ökar bara räknaren med 1
router.patch("/blogs/:id/like", async (req, res) => {
  const postId = Number.parseInt(req.params.id);

  if (!validateNumber(postId)) {
    res.status(400).json({ error: "Post id must be a number" });
    return;
  }

  // Ökar likes-räknaren med 1 i databasen
  const updated = await likeBlogPostById(postId);
  if (!updated) {
    res
      .status(404)
      .json({ error: "A post with id '" + postId + "' does not exist" });
    return;
  }

  res.status(204).send();
});

// PATCH /api/blogs/:id/dislike - Minskar likes med 1 på ett inlägg
// Samma som like men åt andra hållet - minskar räknaren istället
router.patch("/blogs/:id/dislike", async (req, res) => {
  const postId = Number.parseInt(req.params.id);

  if (!validateNumber(postId)) {
    res.status(400).json({ error: "Post id must be a number" });
    return;
  }

  // Minskar likes-räknaren med 1 i databasen
  const updated = await dislikeBlogPostById(postId);
  if (!updated) {
    res
      .status(404)
      .json({ error: "A post with id '" + postId + "' does not exist" });
    return;
  }

  res.status(204).send();
});

// Exporterar vår router så vi kan använda den i main.mjs
export default router;
