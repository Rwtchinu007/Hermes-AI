import { initializeSocketConnection } from "../service/chat.socket";

import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
} from "../service/chat.api";

import {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  addNewMessage,
  addMessages,
  addStreamingMessage,
  appendMessageChunk,
  removeChat,
} from "../chat.slice";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

export const useChat = () => {
  const dispatch = useDispatch();

  const socketRef = useRef(null);

  // Current opened chat
  const currentChatId = useSelector((state) => state.chat.currentChatId);

  // ==============================
  // SOCKET CONNECTION
  // ==============================

  useEffect(() => {
    const socket = initializeSocketConnection();

    socketRef.current = socket;

    // AI streaming chunks
    socket.on("ai-chunk", ({ chatId, chunk }) => {
      dispatch(
        appendMessageChunk({
          chatId,
          chunk,
        }),
      );
    });

    // AI streaming completed
    socket.on("ai-complete", ({ chatId }) => {
      dispatch(setLoading(false));

      console.log("AI streaming completed:", chatId);
    });

    // AI streaming error
    socket.on("ai-error", ({ chatId, message }) => {
      console.error("AI streaming error:", message);

      dispatch(setError(message));
      dispatch(setLoading(false));
    });

    // Cleanup
    return () => {
      socket.off("ai-chunk");
      socket.off("ai-complete");
      socket.off("ai-error");
    };
  }, [dispatch]);

  // ==============================
  // SEND MESSAGE
  // ==============================

  async function handleSendMessage({ message, chatId }) {
    try {
      dispatch(setLoading(true));

      const socket = socketRef.current;

      if (!socket) {
        throw new Error("Socket connection is not initialized");
      }

      if (!socket.connected) {
        throw new Error("Socket is not connected");
      }

      const data = await sendMessage({
        message,
        chatId,
        socketId: socket.id,
      });

      const { chat } = data;

      // If no chatId was provided,
      // backend created a new chat
      const currentChatId = chatId || chat._id;

      // Create new chat in Redux
      if (!chatId) {
        dispatch(
          createNewChat({
            chatId: chat._id,
            title: chat.title?.replace(/\*\*/g, "").replace(/__/g, "").trim(),
          }),
        );
      }

      // Add user's message
      dispatch(
        addNewMessage({
          chatId: currentChatId,
          content: message,
          role: "user",
        }),
      );

      // Create empty AI message
      // Streaming chunks will be added to this message
      dispatch(
        addStreamingMessage({
          chatId: currentChatId,
        }),
      );

      // Make this chat active
      dispatch(setCurrentChatId(currentChatId));
    } catch (error) {
      console.error("Error sending message:", error);

      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to send message",
        ),
      );

      dispatch(setLoading(false));
    }
  }

  // ==============================
  // GET ALL CHATS
  // ==============================

  async function handleGetChats() {
    try {
      dispatch(setLoading(true));

      const data = await getChats();

      const { chats } = data;

      // Convert array from backend
      // into object keyed by chat ID
      dispatch(
        setChats(
          chats.reduce((acc, chat) => {
            acc[chat._id] = {
              id: chat._id,
              title: chat.title?.replace(/\*\*/g, "").replace(/__/g, "").trim(),
              messages: [],
              lastUpdated: chat.updatedAt,
            };

            return acc;
          }, {}),
        ),
      );

      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching chats:", error);

      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch chats",
        ),
      );

      dispatch(setLoading(false));
    }
  }

  // ==============================
  // OPEN CHAT
  // ==============================

  async function handleOpenChat(chatId, chats) {
    try {
      // Messages are fetched only if
      // they haven't already been loaded
      if (chats[chatId]?.messages.length === 0) {
        const data = await getMessages(chatId);

        const { messages } = data;

        const formattedMessages = messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        }));

        dispatch(
          addMessages({
            chatId,
            messages: formattedMessages,
          }),
        );
      }

      // Make selected chat active
      dispatch(setCurrentChatId(chatId));
    } catch (error) {
      console.error("Error opening chat:", error);

      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to open chat",
        ),
      );
    }
  }

  // ==============================
  // DELETE CHAT
  // ==============================

  async function handleDeleteChat(chatId) {
    try {
      dispatch(setLoading(true));

      // Delete from backend/database
      await deleteChat(chatId);

      // Delete from Redux state
      dispatch(removeChat(chatId));

      // If the deleted chat was currently open,
      // clear the current chat
      if (chatId === currentChatId) {
        dispatch(setCurrentChatId(null));
      }
    } catch (error) {
      console.error("Error deleting chat:", error);

      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete chat",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  // ==============================
  // RETURN
  // ==============================

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
  };
};
