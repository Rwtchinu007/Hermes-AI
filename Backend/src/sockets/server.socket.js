import { Server } from "socket.io";

let io;

// Socket.IO server initialize
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("Socket.io server is RUNNING");

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Client disconnect hone par
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

// Socket.IO instance ko doosri files mein access karne ke liye
export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}
