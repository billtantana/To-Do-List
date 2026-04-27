import "dotenv/config";
import express from "express";
import postgresRoutes from './routes/postgresRoutes.js'
import { end } from "./db/index.js";

const app = express();
const port = 3000;

// Middleware
// Use to parse incoming request bodies from HTML
app.use(express.urlencoded({ extended: true }));

// Use for files located in public directory
app.use(express.static("public"));

app.use("/", postgresRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await end(); // Wait for connections to close
  process.exit(0); // Exit with "Success" code
});
