import express, { Router } from "express";

import {
  followShop,
  getSellerEvents,
  getSellerProducts,
  unfollowShop,
} from "../controllers/seller.controller";

const router: Router = express.Router();

router.get("/shops/:shopId/products", getSellerProducts);
router.get("/shops/:shopId/events", getSellerEvents);
router.post("/follow-shop", followShop);
router.post("/unfollow-shop", unfollowShop);

export default router;
