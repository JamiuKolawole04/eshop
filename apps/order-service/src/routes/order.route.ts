import express, { Router } from "express";

import {
  createPaymentIntent,
  createPaymentSession,
  getSellerOrders,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import { isAuthenticated, isSeller } from "@packages/middleware";

const router: Router = express.Router();

router.post("/payment-intent", isAuthenticated, createPaymentIntent);
router.post("/payment-session", isAuthenticated, createPaymentSession);
router.get("/verify-payment-session", isAuthenticated, verifyingPaymentSession);
router.get("/seller", isAuthenticated, isSeller, getSellerOrders);

export default router;
