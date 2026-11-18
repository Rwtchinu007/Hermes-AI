import { Server } from "socket.io";

let io;

// Active AI generations, keyed by `${socketId}:${chatId}`.
// Only the socket that started a generation can stop it.
const activeGenerations = new Map();

const generationKey = (socketId, chatId) => `${socketId}:${chatId}`;

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

    // Client asks to stop an in-progress response
    socket.on("stop-generation", ({ chatId } = {}) => {
      if (!chatId) return;
      const controller = activeGenerations.get(
        generationKey(socket.id, String(chatId)),
      );
      console.log(
        `Stop requested for chat ${chatId}:`,
        controller ? "aborting" : "no active generation",
      );
      controller?.abort();
    });

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

/**
 * Register a generation so the client can cancel it.
 * Returns an AbortController whose signal is passed to the AI service.
 */
export function startGeneration(socketId, chatId) {
  const controller = new AbortController();
  if (socketId) {
    const key = generationKey(socketId, String(chatId));
    activeGenerations.get(key)?.abort();
    activeGenerations.set(key, controller);
  }
  return controller;
}

export function endGeneration(socketId, chatId, controller) {
  if (!socketId) return;
  const key = generationKey(socketId, String(chatId));
  if (activeGenerations.get(key) === controller) {
    activeGenerations.delete(key);
  }
}
