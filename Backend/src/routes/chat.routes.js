import {Router} from "express";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
  renameChat,
  regenerateResponse,
  setMessageFeedback,
} from "../controllers/chat.controller.js";
import {authUser} from "../middlewares/auth.middleware.js";

const chatRouter = Router();


chatRouter.post("/message",authUser,sendMessage);
chatRouter.get("/",authUser,getChats);
chatRouter.get("/:chatId/messages",authUser,getMessages);
chatRouter.delete("/delete/:chatId",authUser,deleteChat);

// Rename a chat: PATCH /api/chats/:chatId { title }
chatRouter.patch("/:chatId",authUser,renameChat);

// Regenerate / retry the last AI response: POST /api/chats/:chatId/regenerate { socketId }
chatRouter.post("/:chatId/regenerate",authUser,regenerateResponse);

// Like / dislike an AI message: PATCH /api/chats/:chatId/messages/:messageId/feedback { feedback }
chatRouter.patch("/:chatId/messages/:messageId/feedback",authUser,setMessageFeedback);

export default chatRouter;
