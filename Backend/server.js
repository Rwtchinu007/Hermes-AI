// Must be the first import so every module below sees the .env values
import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

// The Gemini SDK can reject an internal promise when a response stream
// errors or is cancelled ("Error reading from the stream"). Nothing awaits
// that promise, and Node would otherwise crash the whole server. The real
// error still reaches the request handler, so log and keep serving.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason?.message || reason);
});

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