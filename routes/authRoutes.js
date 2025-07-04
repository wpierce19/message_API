import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import protect from "../middleware/protect.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", protect, getMe);

export default authRouter;