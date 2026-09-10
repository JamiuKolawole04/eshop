import express, { Router } from "express";
import { newConversation } from "../controllers/chatting.controller";

const router: Router = express.Router();

router.post("/", newConversation);

export default router;
