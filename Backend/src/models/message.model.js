import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"], // allowed values for role
      required: true,
    },
    // Optional user feedback on AI messages
    feedback: {
      type: String,
      enum: ["like", "dislike", null],
      default: null,
    },
  },
  { timestamps: true },
);

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;