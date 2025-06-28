import { Router } from "express";
import protect from "../middleware/protect.js";
import path from "path";
import multer from "multer";
import {
  getMessages,
  createMessage,
  getMessage,
  markAsRead,
  addReply,
  reactToMessage,
  uploadEditorImage
} from "../controllers/messageController.js";

const upload = multer({
  dest: path.join("/mnt/data/uploads"),
});
const messageRouter = Router();

// These will be under /api/messages
messageRouter.get("/", protect, getMessages);
messageRouter.post("/", protect, createMessage);
messageRouter.post("/upload-image",protect,upload.single("image"),uploadEditorImage);
messageRouter.get("/:id", protect, getMessage);
messageRouter.patch("/:id/read", protect, markAsRead);
messageRouter.post("/:id/reply", protect, addReply);
messageRouter.post("/:id/react", protect, reactToMessage);
messageRouter.post("/:id/react/:commentId", protect, reactToMessage);

export default messageRouter;