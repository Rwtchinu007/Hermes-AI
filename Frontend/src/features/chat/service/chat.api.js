import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:3000"
    : window.location.origin,
  withCredentials: true,
});

export const sendMessage = async ({ message, chatId, socketId }) => {
  const response = await api.post("/api/chats/message", {
    message,
    chat: chatId,
    socketId,
  });

  return response.data;
};

export const getChats = async () => {
  const response = await api.get("/api/chats");

  return response.data;
};

export const getMessages = async (chatId) => {
  const response = await api.get(`/api/chats/${chatId}/messages`);

  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/api/chats/delete/${chatId}`);

  return response.data;
};
