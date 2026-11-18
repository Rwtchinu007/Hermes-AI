import mongoose from "mongoose";

import { generateResponse, generateChatTitle } from "../services/ai.service.js";

import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

import {
  getIO,
  startGeneration,
  endGeneration,
} from "../sockets/server.socket.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

// Bump a chat's updatedAt so history ordering reflects activity
const touchChat = (chatId) =>
  chatModel.updateOne({ _id: chatId }, { $set: { updatedAt: new Date() } });

// -------------------------------------
// Stream an AI response over Socket.IO
// Shared by sendMessage and regenerateResponse
// -------------------------------------

async function streamAIResponse({ chatId, messages, socketId }) {
  const io = getIO();
  const emit = (event, payload) => {
    if (socketId) io.to(socketId).emit(event, { chatId, ...payload });
  };

  const controller = startGeneration(socketId, chatId);
  let finalResponse = "";

  try {
    for await (const chunk of generateResponse(messages, {
      signal: controller.signal,
      onStatus: (status) => emit("ai-status", { status }),
    })) {
      // Add chunk to complete response
      finalResponse += chunk;

      // Send chunk to frontend
      emit("ai-chunk", { chunk });
    }

    const stopped = controller.signal.aborted;
    let saved = null;

    if (finalResponse.trim()) {
      saved = await messageModel.create({
        chat: chatId,
        content: finalResponse,
        role: "ai",
      });
      await touchChat(chatId);
    }

    // Tell frontend streaming is done
    emit("ai-complete", { messageId: saved?._id ?? null, stopped });
  } catch (error) {
    // User pressed "Stop generating": keep whatever was produced
    if (controller.signal.aborted) {
      let saved = null;
      if (finalResponse.trim()) {
        saved = await messageModel.create({
          chat: chatId,
          content: finalResponse,
          role: "ai",
        });
        await touchChat(chatId);
      }
      emit("ai-complete", { messageId: saved?._id ?? null, stopped: true });
      return;
    }

    console.error("AI streaming error:", error);

    emit("ai-error", {
      message: "Something went wrong while generating the response.",
    });
  } finally {
    endGeneration(socketId, chatId, controller);
  }
}

// -------------------------------------
// Send a message
// -------------------------------------

export async function sendMessage(req, res) {
  const { message, chat: chatId, socketId } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      message: "Message is required",
      success: false,
    });
  }

  let title = null;
  let chat = null;

  // -------------------------------
  // 1. Use existing chat (must belong to this user) or create a new one
  // -------------------------------
  if (chatId) {
    if (!isValidId(chatId)) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const existing = await chatModel.findOne({
      _id: chatId,
      user: req.user.id,
    });
    if (!existing) {
      return res.status(404).json({ message: "Chat not found" });
    }
  } else {
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
  const userMessage = await messageModel.create({
    chat: currentChatId,
    content: message,
    role: "user",
  });

  if (chatId) await touchChat(chatId);

  // -------------------------------
  // 3. Get all messages
  // -------------------------------
  const messages = await messageModel
    .find({ chat: currentChatId })
    .sort({ createdAt: 1 });

  // -------------------------------
  // 4. Send HTTP response immediately
  // -------------------------------
  res.status(202).json({
    success: true,
    title,
    chat,
    chatId: currentChatId,
    userMessageId: userMessage._id,
  });

  // -------------------------------
  // 5. Stream the AI response
  // -------------------------------
  await streamAIResponse({ chatId: currentChatId, messages, socketId });
}

// -------------------------------------
// Regenerate the last AI response
// Also used to retry after a failed response
// -------------------------------------

export async function regenerateResponse(req, res) {
  const { chatId } = req.params;
  const { socketId } = req.body;

  if (!isValidId(chatId)) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const lastMessage = await messageModel
    .findOne({ chat: chatId })
    .sort({ createdAt: -1 });

  if (!lastMessage) {
    return res.status(400).json({
      message: "Nothing to regenerate",
      success: false,
    });
  }

  // Drop the previous AI answer; the user's prompt stays
  if (lastMessage.role === "ai") {
    await lastMessage.deleteOne();
  }

  const messages = await messageModel
    .find({ chat: chatId })
    .sort({ createdAt: 1 });

  if (messages.length === 0 || messages.at(-1).role !== "user") {
    return res.status(400).json({
      message: "Nothing to regenerate",
      success: false,
    });
  }

  res.status(202).json({ success: true, chatId });

  await streamAIResponse({ chatId, messages, socketId });
}

// -------------------------------------
// Get all chats (most recently active first)
// -------------------------------------

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel
    .find({
      user: user.id,
    })
    .sort({ updatedAt: -1 });

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

  if (!isValidId(chatId)) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const messages = await messageModel
    .find({
      chat: chatId || chat._id,
    })
    .sort({ createdAt: 1 });

  res.status(200).json({
    message: "Messages fetched successfully",
    success: true,
    messages,
  });
}

// -------------------------------------
// Rename chat
// -------------------------------------

export async function renameChat(req, res) {
  const { chatId } = req.params;
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";

  if (!title || title.length > 100) {
    return res.status(400).json({
      message: "Title must be between 1 and 100 characters",
      success: false,
    });
  }

  if (!isValidId(chatId)) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // timestamps: false so renaming doesn't reorder the history
  const chat = await chatModel.findOneAndUpdate(
    { _id: chatId, user: req.user.id },
    { $set: { title } },
    { returnDocument: "after", timestamps: false },
  );

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  res.status(200).json({
    message: "Chat renamed successfully",
    success: true,
    chat,
  });
}

// -------------------------------------
// Message feedback (like / dislike)
// -------------------------------------

export async function setMessageFeedback(req, res) {
  const { chatId, messageId } = req.params;
  const { feedback = null } = req.body;

  if (![null, "like", "dislike"].includes(feedback)) {
    return res.status(400).json({
      message: "Feedback must be 'like', 'dislike' or null",
      success: false,
    });
  }

  if (!isValidId(chatId) || !isValidId(messageId)) {
    return res.status(404).json({ message: "Message not found" });
  }

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const message = await messageModel.findOneAndUpdate(
    { _id: messageId, chat: chatId, role: "ai" },
    { $set: { feedback } },
    { returnDocument: "after" },
  );

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  res.status(200).json({
    message: "Feedback saved",
    success: true,
    feedback: message.feedback,
  });
}

// -------------------------------------
// Delete chat
// -------------------------------------

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  if (!isValidId(chatId)) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  await messageModel.deleteMany({
    chat: chatId,
  });

  res.status(200).json({
    message: "Chat deleted successfully",
    success: true,
  });
}
