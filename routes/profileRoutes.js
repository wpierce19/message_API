import { Router } from "express";
import multer from "multer";
import protect from "../middleware/protect.js";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getPublicProfile,
} from "../controllers/profileController.js";

const upload = multer({ dest: "uploads/" });
const profileRouter = Router();

profileRouter.get("/", protect, getProfile);                  // GET /api/profile
profileRouter.put("/", protect, updateProfile);              // PUT /api/profile
profileRouter.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
profileRouter.delete("/avatar", protect, deleteAvatar);
profileRouter.get("/:id", protect, getPublicProfile);        // GET /api/profile/:id

export default profileRouter;