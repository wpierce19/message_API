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

friendRouter.get("/friends", protect, getFriends);
friendRouter.post("/friends/request/:id", protect, requestFriend);
friendRouter.get("/friends/requests", protect, getRequests);
friendRouter.post("/friends/accept/:id", protect, acceptFriend);
friendRouter.post("/friends/deny/:id", protect, denyFriend);
friendRouter.delete("/friends/:id", protect, removeFriend);

export default friendRouter;