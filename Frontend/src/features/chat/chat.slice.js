import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",

  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },

  reducers: {
    // Normal message add karne ke liye
    addNewMessage: (state, action) => {
      const { chatId, content, role } = action.payload;

      state.chats[chatId].messages.push({
        content,
        role,
      });
    },

    // Existing messages load karne ke liye
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;

      state.chats[chatId].messages.push(...messages);
    },

    // New chat create karne ke liye
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;

      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
    },

    // Chat delete karne ke liye
removeChat: (state, action) => {
  const chatId = action.payload;

  delete state.chats[chatId];
},

    // 🔥 Streaming ke time empty AI message create karega
    addStreamingMessage: (state, action) => {
      const { chatId } = action.payload;

      state.chats[chatId].messages.push({
        content: "",
        role: "ai",
      });
    },

    // 🔥 Har incoming AI chunk ko existing AI message mein add karega
    appendMessageChunk: (state, action) => {
      const { chatId, chunk } = action.payload;

      const messages = state.chats[chatId]?.messages;

      // Agar chat ya messages nahi hain
      if (!messages || messages.length === 0) {
        return;
      }

      const lastMessage = messages[messages.length - 1];

      // Sirf AI message ko update karna hai
      if (lastMessage.role !== "ai") {
        return;
      }

      lastMessage.content += chunk;
    },

    // Saare chats set karne ke liye
    setChats: (state, action) => {
      state.chats = action.payload;
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
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
  addMessages,
  removeChat,

  // 🔥 Streaming actions
  addStreamingMessage,
  appendMessageChunk,
} = chatSlice.actions;

export default chatSlice.reducer;
