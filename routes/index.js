import { Router } from "express";
import authRoutes from "./authRoutes";
import friendRoutes from "./friendRoutes";
import messageRoutes from "./messageRoutes";
import profileRoutes from "./profileRoutes";
import userRoutes from "./userRoutes";

const indexRouter = Router();

indexRouter.use("/api", authRoutes);
indexRouter.use("/api", friendRoutes);
indexRouter.use("/api", messageRoutes);
indexRouter.use("/api", profileRoutes);
indexRouter.use("/api", userRoutes);

export default indexRouter;