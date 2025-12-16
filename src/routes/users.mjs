import express from "express";
import { createUser } from "../repositories/users.mjs";
import { validateString } from "../utilities/validation.mjs";

const router = express.Router();

router.post("/users", async (req, res) => {
  if (!req.body) {
    res.status(400).json({
      error: "A JSON body must be included",
    });
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  if (!validateString(username)) {
    res.status(400).json({
      error: "Username must be included and be a string",
    });
    return;
  }

  if (!validateString(password)) {
    res.status(400).json({
      error: "Password must be included and be a string",
    });
    return;
  }

  if (password.length <= 6) {
    res.status(400).json({
      error: "Password must be at least 7 characters",
    });
    return;
  }

  try {
    // Skippar 'password' egenskapen, den returneras inte
    const user = await createUser(username, password);
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An unexpected error occurred." });
    return;
  }
});

// Exporterar vår router så vi kan använda den i main.mjs
export default router;
