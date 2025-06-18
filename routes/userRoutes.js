import { Router } from "express";
import protect from "../middleware/protect.js";
import { searchUsers } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/search", protect, searchUsers);

export default userRouter;