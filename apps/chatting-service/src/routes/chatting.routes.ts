import express, { Router } from "express";

import {
  fetchMessages,
  fetchSellerMessages,
  getSellerConversations,
  getUserConversations,
  newConversation,
} from "../controllers/chatting.controller";
import {
  isAuthenticated,
  isAuthenticatedAny,
  isSeller,
  isUser,
} from "@packages/middleware";

const router: Router = express.Router();

router.post("/conversations", isAuthenticatedAny, newConversation);
router.get(
  "/conversations/user",
  isAuthenticated("user"),
  isUser,
  getUserConversations,
);
router.get(
  "/conversations/seller",
  isAuthenticated("seller"),
  isSeller,
  getSellerConversations,
);

router.get(
  "/conversations/:conversationId/messages",
  isAuthenticated("user"),
  isUser,
  fetchMessages,
);
router.get(
  "/conversations/:conversationId/messages/seller",
  isAuthenticated("seller"),
  isSeller,
  fetchSellerMessages,
);

export default router;
