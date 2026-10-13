import express, { Router } from "express";

import {
  deleteShop,
  followShop,
  getSellerDetails,
  getSellerEvents,
  getSellerProducts,
  isFollowingShop,
  markNotificationAsRead,
  restoreShop,
  sellerNotifications,
  unfollowShop,
  updateLowStockThreshold,
  updateOrderNotifications,
  updateShopProfile,
  uploadShopAvatar,
  uploadShopCoverBanner,
} from "../controllers/seller.controller";
import {
  isAuthenticated,
  isAuthenticatedAny,
  isSeller,
  isUser,
} from "@packages/middleware";

const router: Router = express.Router();

router.get(
  "/notifications",
  isAuthenticated("seller"),
  isSeller,
  sellerNotifications,
);

router.patch(
  "/notifications/:notificationId",
  isAuthenticatedAny,
  markNotificationAsRead,
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

router.patch(
  "/shops/profile",
  isAuthenticated("seller"),
  isSeller,
  updateShopProfile,
);

router.post("/follow-shop", isAuthenticated("user"), isUser, followShop);
router.post("/unfollow-shop", isAuthenticated("user"), isUser, unfollowShop);
router.get("/is-following/:shopId", isAuthenticated("user"), isFollowingShop);

router.put(
  "/shops/low-stock",
  isAuthenticated("seller"),
  isSeller,
  updateLowStockThreshold,
);

router.put(
  "/shops/order-notifications",
  isAuthenticated("seller"),
  isSeller,
  updateOrderNotifications,
);

router.get("/:id", getSellerDetails);

router.delete("/shops", isAuthenticated("seller"), isSeller, deleteShop);
router.put("/shops/restore", isAuthenticated("seller"), isSeller, restoreShop);

export default router;
