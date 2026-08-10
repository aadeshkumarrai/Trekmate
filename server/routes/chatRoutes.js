import express from "express";
import {
  clearChatHistory,
  getChatHistory,
  sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Logged-in user ki saved chat history
router.get("/history", getChatHistory);

// Logged-in user ki history clear karega
router.delete("/history", clearChatHistory);

// Groq ko message send karega aur history save karega
router.post("/", sendMessage);

export default router;