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

export const renameChat = async (chatId, title) => {
  const response = await api.patch(`/api/chats/${chatId}`, { title });
  return response.data;
};

export const regenerateResponse = async ({ chatId, socketId }) => {
  const response = await api.post(`/api/chats/${chatId}/regenerate`, {
    socketId,
  });
  return response.data;
};

export const setMessageFeedback = async ({ chatId, messageId, feedback }) => {
  const response = await api.patch(
    `/api/chats/${chatId}/messages/${messageId}/feedback`,
    { feedback },
  );
  return response.data;
};
