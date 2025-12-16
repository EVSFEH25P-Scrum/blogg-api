import express from "express";
import { validateNumber, validateString } from "../utilities/validation.mjs";
import { loginUser } from "../repositories/users.mjs";
import { createComment } from "../repositories/comments.mjs";

const router = express.Router();

router.post("/comments", async (req, res) => {
  const user = await loginUser(req.headers.username, req.headers.password);
  if (!user) {
    res.status(401).json({
      error: "The username or password is incorrect",
    });
    return;
  }

  if (!req.body) {
    res.status(400).json({
      error: "A JSON body must be included",
    });
    return;
  }

  const content = req.body.content;
  const postId = req.body.postId;

  if (!validateString(content)) {
    res.status(400).json({
      error: "Content must be included and be a string",
    });
    return;
  }

  if (!validateNumber(postId)) {
    res.status(400).json({
      error: "PostId must be included and be a number",
    });
    return;
  }

  try {
    const comment = await createComment(content, postId, user.id);
    res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An unexpected error occurred." });
    return;
  }
});

// Exporterar vår router så vi kan använda den i main.mjs
export default router;
