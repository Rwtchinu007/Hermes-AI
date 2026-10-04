import { io } from "socket.io-client";

let socket = null;

export const initializeSocketConnection = () => {
  // Agar socket already connected hai,
  // to naya connection create mat karo
  if (socket) {
    return socket;
  }

  const socketURL = import.meta.env.DEV
    ? "http://localhost:3000"
    : window.location.origin;

  socket = io(socketURL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
  });

  return socket;
};
