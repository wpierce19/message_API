import { Router } from "express";
import protect from "../middleware/protect.js";
import {
  getFriends,
  requestFriend,
  getRequests,
  acceptFriend,
  denyFriend,
  removeFriend
} from "../controllers/friendController.js";

const friendRouter = Router();

// These will be prefixed with /api/friends
friendRouter.get("/", protect, getFriends);
friendRouter.post("/request/:id", protect, requestFriend);
friendRouter.get("/requests", protect, getRequests);
friendRouter.post("/accept/:id", protect, acceptFriend);
friendRouter.post("/deny/:id", protect, denyFriend);
friendRouter.delete("/:id", protect, removeFriend);

export default friendRouter;