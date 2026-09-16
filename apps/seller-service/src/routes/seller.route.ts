import express, { Router } from "express";

import {
  getSellerEvents,
  getSellerProducts,
} from "../controllers/seller.controller";

const router: Router = express.Router();

router.get("/shops/:shopId/products", getSellerProducts);
router.get("/shops/:shopId/events", getSellerEvents);

export default router;
