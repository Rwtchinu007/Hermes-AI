import { generateResponse, generateChatTitle } from "../services/ai.service.js";

import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

import { getIO } from "../sockets/server.socket.js";

export async function sendMessage(req, res) {
  const { message, chat: chatId, socketId } = req.body;

  let title = null;
  let chat = null;

  // -------------------------------
  // 1. Create new chat if needed
  // -------------------------------
  if (!chatId) {
    title = await generateChatTitle(message);

    chat = await chatModel.create({
      user: req.user.id,
      title: title,
    });
  }

  const currentChatId = chatId || chat._id;

  // -------------------------------
  // 2. Save user's message
  // -------------------------------
  await messageModel.create({
    chat: currentChatId,
    content: message,
    role: "user",
  });

  // -------------------------------
  // 3. Get all messages
  // -------------------------------
  const messages = await messageModel.find({
    chat: currentChatId,
  });

  // -------------------------------
  // 4. Get Socket.IO instance
  // -------------------------------
  const io = getIO();

  // -------------------------------
  // 5. Send HTTP response immediately
  // -------------------------------
  res.status(202).json({
    success: true,
    title,
    chat,
    chatId: currentChatId,
  });

  try {
    let finalResponse = "";

    for await (const chunk of generateResponse(messages)) {
      // Add chunk to complete response
      finalResponse += chunk;

      // Send chunk to frontend
      if (socketId) {
        io.to(socketId).emit("ai-chunk", {
          chatId: currentChatId,
          chunk,
        });
      }
    }
    await messageModel.create({
      chat: currentChatId,
      content: finalResponse,
      role: "ai",
    });

    // -------------------------------
    // 8. Tell frontend streaming is done
    // -------------------------------
    if (socketId) {
      io.to(socketId).emit("ai-complete", {
        chatId: currentChatId,
      });
    }
  } catch (error) {
    console.error("AI streaming error:", error);

    if (socketId) {
      io.to(socketId).emit("ai-error", {
        chatId: currentChatId,
        message: "Something went wrong while generating the response.",
      });
    }
  }
}

// -------------------------------------
// Get all chats
// -------------------------------------

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({
    user: user.id,
  });

  res.status(200).json({
    message: "Chats fetched successfully",
    success: true,
    chats,
  });
}

// -------------------------------------
// Get messages of a chat
// -------------------------------------

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const messages = await messageModel.find({
    chat: chatId || chat._id,
  });

  res.status(200).json({
    message: "Messages fetched successfully",
    success: true,
    messages,
  });
}

// -------------------------------------
// Delete chat
// -------------------------------------

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  await messageModel.deleteMany({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat deleted successfully",
    success: true,
  });
}
