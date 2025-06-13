import { Router } from "express";
import multer from "multer";
import protect from "../middleware/protect.js";
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, getPublicProfile } from "../controllers/profileController";

const upload = multer({dest: "uploads/"});
const profileRouter = Router();

profileRouter.get("/profile", protect, getProfile);
profileRouter.put("/profile", protect, updateProfile);
profileRouter.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
profileRouter.delete("/avatar", profileRouter, deleteAvatar);
profileRouter.get("/profile/:id", protect, getPublicProfile);

export default profileRouter;