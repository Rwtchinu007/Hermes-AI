import { createSlice, nanoid } from "@reduxjs/toolkit";

/*
  Message shape:
  {
    localId,          // stable React key (client only)
    id,               // MongoDB _id (null until saved)
    role,             // "user" | "ai"
    content,
    feedback,         // "like" | "dislike" | null
    status,           // "done" | "streaming" | "stopped" | "error"
    error,            // error text when status === "error"
    retry,            // { type: "send" | "regenerate" | "reload", message? }
  }

  generating[chatId] = "waiting" | "searching" | "streaming"
  Phases come from real server events: "waiting" until the first socket
  event, "searching" on ai-status, "streaming" on the first ai-chunk.
*/

const makeMessage = ({ id = null, role, content = "", feedback = null }) => ({
  localId: nanoid(),
  id,
  role,
  content,
  feedback,
  status: "done",
  error: null,
  retry: null,
});

const lastStreamingAi = (chat) => {
  const last = chat?.messages[chat.messages.length - 1];
  return last && last.role === "ai" && last.status === "streaming"
    ? last
    : null;
};

const initialState = {
  chats: {},
  currentChatId: null,
  isLoading: false,
  listLoaded: false,
  error: null,
  generating: {},
  // Chunks that arrived before their chat existed in state
  // (new chat: socket chunks can race the HTTP response)
  orphanChunks: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Normal message add karne ke liye
    addNewMessage: (state, action) => {
      const { chatId, content, role, id } = action.payload;
      state.chats[chatId]?.messages.push(makeMessage({ id, role, content }));
    },

    // Existing messages load karne ke liye (replaces, so no duplicates)
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;
      chat.messages = messages.map(makeMessage);
      chat.loaded = true;
    },

    // New chat create karne ke liye
    createNewChat: (state, action) => {
      const { chatId, title, isTemp = false } = action.payload;
      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        loaded: true,
        isTemp,
        lastUpdated: new Date().toISOString(),
      };
    },

    // Swap a temporary (optimistic) chat for the real one from the server
    replaceTempChat: (state, action) => {
      const { tempId, chatId, title } = action.payload;
      const temp = state.chats[tempId];
      if (!temp) return;

      delete state.chats[tempId];
      state.chats[chatId] = {
        ...temp,
        id: chatId,
        title: title || temp.title,
        isTemp: false,
      };

      const pending = state.orphanChunks[chatId];
      if (pending) {
        const msg = lastStreamingAi(state.chats[chatId]);
        if (msg) msg.content += pending;
        delete state.orphanChunks[chatId];
      }

      if (state.generating[tempId]) {
        state.generating[chatId] = pending
          ? "streaming"
          : state.generating[tempId];
        delete state.generating[tempId];
      }

      if (state.currentChatId === tempId) state.currentChatId = chatId;
    },

    // Chat delete karne ke liye
    removeChat: (state, action) => {
      const chatId = action.payload;
      delete state.chats[chatId];
      delete state.generating[chatId];
      if (state.currentChatId === chatId) state.currentChatId = null;
    },

    renameChat: (state, action) => {
      const { chatId, title } = action.payload;
      if (state.chats[chatId]) state.chats[chatId].title = title;
    },

    touchChat: (state, action) => {
      const chat = state.chats[action.payload];
      if (chat) chat.lastUpdated = new Date().toISOString();
    },

    // Streaming ke time empty AI message create karega
    addStreamingMessage: (state, action) => {
      const { chatId } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;
      const msg = makeMessage({ role: "ai" });
      msg.status = "streaming";
      chat.messages.push(msg);
    },

    // Har incoming AI chunk ko existing AI message mein add karega
    appendMessageChunk: (state, action) => {
      const { chatId, chunk } = action.payload;
      const chat = state.chats[chatId];

      if (!chat) {
        state.orphanChunks[chatId] = (state.orphanChunks[chatId] || "") + chunk;
        return;
      }

      const msg = lastStreamingAi(chat);
      if (!msg) return;

      msg.content += chunk;
      if (state.generating[chatId]) state.generating[chatId] = "streaming";
    },

    setGenerating: (state, action) => {
      const { chatId, phase } = action.payload;
      state.generating[chatId] = phase;
    },

    completeStreaming: (state, action) => {
      const { chatId, messageId, stopped } = action.payload;
      const chat = state.chats[chatId];
      const msg = lastStreamingAi(chat);
      if (msg) {
        msg.id = messageId || null;
        msg.status = stopped ? "stopped" : "done";
        // Nothing generated and nothing saved: drop the empty bubble
        if (!msg.content && !stopped) chat.messages.pop();
      }
      delete state.generating[chatId];
      if (chat) chat.lastUpdated = new Date().toISOString();
    },

    failStreaming: (state, action) => {
      const { chatId, error, retry } = action.payload;
      const chat = state.chats[chatId];
      const msg = lastStreamingAi(chat);
      if (msg) {
        msg.status = "error";
        msg.error = error;
        msg.retry = retry;
      }
      delete state.generating[chatId];
      delete state.orphanChunks[chatId];
    },

    // Regenerate: remove the last AI answer before streaming a new one
    removeLastAiMessage: (state, action) => {
      const chat = state.chats[action.payload];
      if (!chat) return;
      const last = chat.messages[chat.messages.length - 1];
      if (last?.role === "ai") chat.messages.pop();
    },

    // Retry a failed send: drop the failed user message and everything after
    removeMessagesFrom: (state, action) => {
      const { chatId, localId } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;
      const index = chat.messages.findIndex((m) => m.localId === localId);
      if (index !== -1) chat.messages.splice(index);
    },

    setMessageFeedback: (state, action) => {
      const { chatId, localId, feedback } = action.payload;
      const msg = state.chats[chatId]?.messages.find(
        (m) => m.localId === localId,
      );
      if (msg) msg.feedback = feedback;
    },

    // Saare chats set karne ke liye (keeps already-loaded messages)
    setChats: (state, action) => {
      const next = action.payload;
      for (const id of Object.keys(next)) {
        const existing = state.chats[id];
        if (existing?.loaded) {
          next[id].messages = existing.messages;
          next[id].loaded = true;
        }
      }
      // Keep optimistic chats that the server doesn't know about yet
      for (const chat of Object.values(state.chats)) {
        if (chat.isTemp) next[chat.id] = chat;
      }
      state.chats = next;
      state.listLoaded = true;
    },

    // Current/open chat change karne ke liye
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },

    // Loading state change karne ke liye
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Error set karne ke liye
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Logout: clear user-specific chat state (server data is untouched)
    resetChatState: () => initialState,
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  replaceTempChat,
  addNewMessage,
  addMessages,
  removeChat,
  renameChat,
  touchChat,
  // Streaming actions
  addStreamingMessage,
  appendMessageChunk,
  setGenerating,
  completeStreaming,
  failStreaming,
  removeLastAiMessage,
  removeMessagesFrom,
  setMessageFeedback,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
