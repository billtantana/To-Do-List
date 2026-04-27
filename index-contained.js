import express from "express";
import containedRoutes from './routes/containedRoutes.js'

const app = express();
const port = 3000;

// Middleware
// Use to parse incoming request bodies from HTML
app.use(express.urlencoded({ extended: true }));

// Use for files located in public directory
app.use(express.static("public"));

app.use("/", containedRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
