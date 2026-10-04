import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors";
import chatRouter from "./routes/chat.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// from backend/src -> backend -> hermes.ai -> frontend/dist
const frontendPath = path.join(__dirname, "../../Frontend/dist");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent in cross-origin requests
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  }),
);

// // Health check
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Server is running" });
// });

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// serve react frontend
app.use(express.static(frontendPath));

// Handle all other routes and serve the frontend
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;
