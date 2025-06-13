import { Router } from "express";
import protect from "../middleware/protect.js";
import multer from "multer";
import {
    getMessages,
    createMessage,
    getMessage,
    markAsRead,
    addReply,
    reactToMessage
} from "../controllers/messageController.js";


const upload = multer({dest: "uploads/"});
const messageRouter = Router();

messageRouter.get("/messages", protect, getMessages);
messageRouter.post("/messages", protect, upload.single("attachment"), createMessage);
messageRouter.get("/messages/:id", protect, getMessage);
messageRouter.patch("/messages/:id/read", protect, markAsRead);
messageRouter.post("/messahes/:id/reply", protect, addReply);
messageRouter.post("/messages/:id/react", protect, reactToMessage);

export default messageRouter;