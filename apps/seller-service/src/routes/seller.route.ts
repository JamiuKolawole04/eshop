import express, { Router } from "express";

import {
  followShop,
  getSellerDetails,
  getSellerEvents,
  getSellerProducts,
  isFollowingShop,
  unfollowShop,
} from "../controllers/seller.controller";
import { isAuthenticated, isUser } from "@packages/middleware";

const router: Router = express.Router();

router.get("/shops/:shopId/products", getSellerProducts);
router.get("/shops/:shopId/events", getSellerEvents);

router.post("/follow-shop", isAuthenticated("user"), isUser, followShop);
router.post("/unfollow-shop", isAuthenticated("user"), isUser, unfollowShop);
router.get(
  "/sellers/is-following/:id",
  isAuthenticated("user"),
  isFollowingShop,
);
router.get("/:id", getSellerDetails);

export default router;
