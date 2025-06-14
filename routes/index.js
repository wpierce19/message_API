import { Router } from "express";
import authRoutes from "./authRoutes.js";
import friendRoutes from "./friendRoutes.js";
import messageRoutes from "./messageRoutes.js";
import profileRoutes from "./profileRoutes.js";
import userRoutes from "./userRoutes.js";

const indexRouter = Router();

indexRouter.use("/auth", authRoutes);
indexRouter.use("/friends", friendRoutes);
indexRouter.use("/messages", messageRoutes);
indexRouter.use("/profile", profileRoutes);
indexRouter.use("/users", userRoutes);

export default indexRouter;