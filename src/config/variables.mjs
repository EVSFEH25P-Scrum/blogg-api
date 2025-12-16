import dotenv from "dotenv";

// Laddar in environment variables från .env-filen
// Detta gör att vi kan använda t.ex. process.env.DATABASE_HOST i vår kod
// Alla miljövariabler som finns i .env blir tillgängliga via process.env
dotenv.config();
