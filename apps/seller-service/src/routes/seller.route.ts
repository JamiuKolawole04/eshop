import express, { Router } from "express";

import {
  followShop,
  getSellerDetails,
  getSellerEvents,
  getSellerProducts,
  isFollowingShop,
  sellerNotifications,
  unfollowShop,
  uploadShopAvatar,
  uploadShopCoverBanner,
} from "../controllers/seller.controller";
import { isAuthenticated, isSeller, isUser } from "@packages/middleware";

const router: Router = express.Router();

router.get(
  "/notifications",
  isAuthenticated("seller"),
  isSeller,
  sellerNotifications,
);

router.get("/shops/:shopId/products", getSellerProducts);
router.get("/shops/:shopId/events", getSellerEvents);

router.post(
  "/shops/avatar",
  isAuthenticated("seller"),
  isSeller,
  uploadShopAvatar,
);
router.post(
  "/shops/cover-banner",
  isAuthenticated("seller"),
  isSeller,
  uploadShopCoverBanner,
);

router.post("/follow-shop", isAuthenticated("user"), isUser, followShop);
router.post("/unfollow-shop", isAuthenticated("user"), isUser, unfollowShop);
router.get("/is-following/:shopId", isAuthenticated("user"), isFollowingShop);

router.get("/:id", getSellerDetails);

export default router;
