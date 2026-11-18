import { nanoid } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";

import {
  initializeSocketConnection,
  waitForConnection,
} from "../service/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
  renameChat as renameChatApi,
  regenerateResponse,
  setMessageFeedback as setMessageFeedbackApi,
} from "../service/chat.api";
import {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  replaceTempChat,
  addNewMessage,
  addMessages,
  addStreamingMessage,
  appendMessageChunk,
  setGenerating,
  completeStreaming,
  failStreaming,
  removeChat,
  renameChat,
  touchChat,
  removeLastAiMessage,
  removeMessagesFrom,
  setMessageFeedback,
} from "../chat.slice";
import { addToast } from "../../ui/ui.slice";
import { getErrorMessage } from "../../../app/errors";

const cleanTitle = (title) =>
  title?.replace(/\*\*/g, "").replace(/__/g, "").trim() || "New chat";

// Chats the user asked to stop. Re-sent on the next chunk to cover the
// short window before the server registers the generation.
const stopRequested = new Set();

const toMessage = (msg) => ({
  id: msg._id,
  content: msg.content,
  role: msg.role,
  feedback: msg.feedback ?? null,
});

// ==============================
// SOCKET SUBSCRIPTION
// Mount exactly once (Dashboard) so listeners are never duplicated.
// ==============================

export function useChatSocket() {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    const socket = initializeSocketConnection();

    const onStatus = ({ chatId, status }) => {
      const phase = store.getState().chat.generating[chatId];
      if (status === "searching" && phase && phase !== "streaming") {
        dispatch(setGenerating({ chatId, phase: "searching" }));
      }
    };

    // AI streaming chunks
    const onChunk = ({ chatId, chunk }) => {
      if (stopRequested.has(String(chatId))) {
        socket.emit("stop-generation", { chatId });
      }
      dispatch(appendMessageChunk({ chatId, chunk }));
    };

    // AI streaming completed
    const onComplete = ({ chatId, messageId, stopped }) => {
      stopRequested.delete(String(chatId));
      dispatch(completeStreaming({ chatId, messageId, stopped }));
    };

    // AI streaming error
    const onError = ({ chatId, message }) => {
      stopRequested.delete(String(chatId));
      console.error("AI streaming error:", message);
      dispatch(setError(message));
      dispatch(
        failStreaming({
          chatId,
          error: message || "Something went wrong while generating.",
          retry: { type: "regenerate" },
        }),
      );
    };

    // Connection dropped mid-response: chunks for the old socket are lost,
    // but the server still saves the answer, so offer to reload it.
    const onDisconnect = () => {
      const { generating } = store.getState().chat;
      for (const chatId of Object.keys(generating)) {
        dispatch(
          failStreaming({
            chatId,
            error: "Connection lost while generating.",
            retry: { type: "reload" },
          }),
        );
      }
    };

    socket.on("ai-status", onStatus);
    socket.on("ai-chunk", onChunk);
    socket.on("ai-complete", onComplete);
    socket.on("ai-error", onError);
    socket.on("disconnect", onDisconnect);

    // Cleanup
    return () => {
      socket.off("ai-status", onStatus);
      socket.off("ai-chunk", onChunk);
      socket.off("ai-complete", onComplete);
      socket.off("ai-error", onError);
      socket.off("disconnect", onDisconnect);
    };
  }, [dispatch, store]);
}

// ==============================
// CHAT ACTIONS
// ==============================

export const useChat = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const chatState = () => store.getState().chat;
  const toastError = (message) =>
    dispatch(addToast({ message, type: "error" }));

  // ==============================
  // SEND MESSAGE
  // Optimistic: the user's message and a "thinking" placeholder appear
  // immediately; a temporary chat is used until the server returns its id.
  // ==============================
  async function handleSendMessage({ message, chatId }) {
    const isNew = !chatId;
    const targetId = isNew ? `temp-${nanoid()}` : chatId;

    if (!isNew && chatState().generating[chatId]) return null;

    if (isNew) {
      dispatch(
        createNewChat({ chatId: targetId, title: "New chat", isTemp: true }),
      );
      dispatch(setCurrentChatId(targetId));
    }

    dispatch(addNewMessage({ chatId: targetId, content: message, role: "user" }));
    dispatch(addStreamingMessage({ chatId: targetId }));
    dispatch(setGenerating({ chatId: targetId, phase: "waiting" }));
    dispatch(setLoading(true));

    try {
      const socket = await waitForConnection(initializeSocketConnection());

      const data = await sendMessage({
        message,
        chatId,
        socketId: socket.id,
      });

      if (isNew) {
        const realId = data.chat._id;
        dispatch(
          replaceTempChat({
            tempId: targetId,
            chatId: realId,
            title: cleanTitle(data.chat.title),
          }),
        );
        if (stopRequested.delete(targetId)) {
          stopRequested.add(String(realId));
          socket.emit("stop-generation", { chatId: realId });
        }
        return { chatId: realId };
      }

      dispatch(touchChat(chatId));
      return { chatId };
    } catch (error) {
      console.error("Error sending message:", error);
      const text = getErrorMessage(error, "Failed to send message");
      dispatch(setError(text));
      dispatch(
        failStreaming({
          chatId: targetId,
          error: text,
          retry: { type: "send", message },
        }),
      );
      return { error: text };
    } finally {
      dispatch(setLoading(false));
    }
  }

  // ==============================
  // REGENERATE (also used for "Retry" after a failed answer)
  // ==============================
  async function handleRegenerate(chatId) {
    if (!chatId || chatState().generating[chatId]) return;

    dispatch(removeLastAiMessage(chatId));
    dispatch(addStreamingMessage({ chatId }));
    dispatch(setGenerating({ chatId, phase: "waiting" }));

    try {
      const socket = await waitForConnection(initializeSocketConnection());
      await regenerateResponse({ chatId, socketId: socket.id });
    } catch (error) {
      dispatch(
        failStreaming({
          chatId,
          error: getErrorMessage(error, "Couldn't regenerate the response"),
          retry: { type: "regenerate" },
        }),
      );
    }
  }

  // ==============================
  // STOP GENERATING
  // ==============================
  function handleStopGeneration(chatId) {
    if (!chatId) return;
    stopRequested.add(String(chatId));
    if (!String(chatId).startsWith("temp-")) {
      initializeSocketConnection().emit("stop-generation", { chatId });
    }
  }

  // ==============================
  // RETRY A FAILED MESSAGE
  // ==============================
  async function handleRetry(chatId, failedMessage) {
    const chat = chatState().chats[chatId];
    const retry = failedMessage?.retry;
    if (!chat || !retry) return null;

    if (retry.type === "regenerate") {
      await handleRegenerate(chatId);
      return { chatId };
    }

    if (retry.type === "reload") {
      await loadMessages(chatId);
      return { chatId };
    }

    // "send": the request never reached the server — resend it
    if (chat.isTemp) {
      dispatch(removeChat(chatId));
      return handleSendMessage({ message: retry.message, chatId: null });
    }

    const index = chat.messages.findIndex(
      (m) => m.localId === failedMessage.localId,
    );
    const userMessage = chat.messages[index - 1];
    if (userMessage?.role === "user") {
      dispatch(removeMessagesFrom({ chatId, localId: userMessage.localId }));
    }
    return handleSendMessage({ message: retry.message, chatId });
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
              title: cleanTitle(chat.title),
              messages: [],
              loaded: false,
              lastUpdated: chat.updatedAt,
            };

            return acc;
          }, {}),
        ),
      );
    } catch (error) {
      console.error("Error fetching chats:", error);
      const text = getErrorMessage(error, "Failed to fetch chats");
      dispatch(setError(text));
      toastError(text);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function loadMessages(chatId) {
    const data = await getMessages(chatId);
    dispatch(addMessages({ chatId, messages: data.messages.map(toMessage) }));
  }

  // ==============================
  // OPEN CHAT
  // Returns false if the chat couldn't be opened.
  // ==============================
  async function handleOpenChat(chatId) {
    const chat = chatState().chats[chatId];

    // Make selected chat active right away; messages load in behind it
    dispatch(setCurrentChatId(chatId));

    try {
      // Messages are fetched only if
      // they haven't already been loaded
      if (chat && !chat.loaded && !chat.isTemp) {
        await loadMessages(chatId);
      }
      return true;
    } catch (error) {
      console.error("Error opening chat:", error);
      const text = getErrorMessage(error, "Failed to open chat");
      dispatch(setError(text));
      toastError(text);
      return false;
    }
  }

  // ==============================
  // RENAME CHAT (optimistic)
  // ==============================
  async function handleRenameChat(chatId, title) {
    const trimmed = title.trim();
    const previous = chatState().chats[chatId]?.title;
    if (!trimmed || trimmed === previous) return;

    dispatch(renameChat({ chatId, title: trimmed }));

    try {
      await renameChatApi(chatId, trimmed);
    } catch (error) {
      dispatch(renameChat({ chatId, title: previous }));
      toastError(getErrorMessage(error, "Couldn't rename the chat"));
    }
  }

  // ==============================
  // DELETE CHAT
  // ==============================
  async function handleDeleteChat(chatId) {
    try {
      if (chatState().generating[chatId]) handleStopGeneration(chatId);

      // Delete from backend/database
      await deleteChat(chatId);

      // Delete from Redux state (also clears it if it was open)
      dispatch(removeChat(chatId));
      dispatch(addToast({ message: "Chat deleted" }));
      return true;
    } catch (error) {
      console.error("Error deleting chat:", error);
      const text = getErrorMessage(error, "Failed to delete chat");
      dispatch(setError(text));
      toastError(text);
      return false;
    }
  }

  // ==============================
  // FEEDBACK (optimistic)
  // ==============================
  async function handleFeedback(chatId, message, value) {
    if (!message.id) return;
    const next = message.feedback === value ? null : value;
    const previous = message.feedback;

    dispatch(setMessageFeedback({ chatId, localId: message.localId, feedback: next }));

    try {
      await setMessageFeedbackApi({ chatId, messageId: message.id, feedback: next });
      if (next) dispatch(addToast({ message: "Thanks for the feedback" }));
    } catch (error) {
      dispatch(
        setMessageFeedback({ chatId, localId: message.localId, feedback: previous }),
      );
      toastError(getErrorMessage(error, "Couldn't save feedback"));
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
    handleRenameChat,
    handleRegenerate,
    handleStopGeneration,
    handleRetry,
    handleFeedback,
  };
};
