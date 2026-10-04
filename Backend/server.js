import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Connect to database
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});