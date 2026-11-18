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

/**
 * Resolve once the socket is connected (or reject after `timeout` ms).
 * Avoids failing a send just because the connection is still opening.
 */
export const waitForConnection = (target, timeout = 8000) =>
  new Promise((resolve, reject) => {
    if (target.connected) return resolve(target);

    const timer = setTimeout(() => {
      target.off("connect", onConnect);
      reject(new Error("Couldn't connect to Hermes. Check your connection."));
    }, timeout);

    function onConnect() {
      clearTimeout(timer);
      resolve(target);
    }

    target.once("connect", onConnect);
    if (!target.active) target.connect();
  });

// Logout: close the connection so a new session gets a fresh socket
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
