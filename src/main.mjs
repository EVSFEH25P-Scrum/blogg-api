// Importerar våra konfigurationsfiler och beroenden
import "./config/variables.mjs"; // Laddar in miljövariabler från .env-filen
import express from "express"; // Express är ramverket vi använder för att bygga vår API
import { setupDatabase } from "./config/database.mjs"; // Funktion som skapar våra databastabeller
import postRoutes from "./routes/posts.mjs"; // Alla våra endpoints för blogginlägg
import userRoutes from "./routes/users.mjs";
import commentRoutes from "./routes/comments.mjs";

// Startar databasen och skapar tabellerna om de inte finns
setupDatabase();

// Hämtar porten från miljövariablerna (t.ex. 3000)
const appPort = Number.parseInt(process.env.APP_PORT);

// Skapar vår Express-app - detta är själva hjärtat i vår backend
const app = express();

// Middleware som gör att vi kan läsa JSON från request bodies
// Utan denna rad skulle vi inte kunna ta emot JSON-data från frontenden
app.use(express.json());

// Kopplar alla våra blogg-routes till /api
// Detta betyder att alla endpoints i postRoutes börjar med /api
// t.ex. /api/blogs, /api/blogs/:id osv
app.use("/api", postRoutes);

app.use("/api", userRoutes);
app.use("/api", commentRoutes);

// Startar servern och lyssnar på den angivna porten
app.listen(appPort, () => {
  console.log("Application has started on port: " + appPort);
});

/*

# Models

## Blogpost

id Serial
title: Text
content: Text
created_at: Timestamp
author: Text
likes: Integer

## Comment (for later)
## User (for later)

# Endpoints

## POST /api/blogs
## GET /api/blogs
## GET /api/blogs/:id
## PUT /api/blogs/:id
## DELETE /api/blogs/:id

## GET /api/authors/:id/blogs

*/
