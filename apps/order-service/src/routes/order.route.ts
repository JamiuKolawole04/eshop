import express, { Router } from "express";

import {
  createPaymentIntent,
  createPaymentSession,
  getOrderDetails,
  getSellerOrders,
  getUserOrders,
  updateDeliveryStatus,
  verifyCouponCode,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import {
  isAuthenticated,
  isSeller,
  isUser,
  isAuthenticatedAny,
} from "@packages/middleware";

const router: Router = express.Router();

router.post("/payment-intent", isAuthenticatedAny, createPaymentIntent);
router.post("/payment-session", isAuthenticatedAny, createPaymentSession);
router.get(
  "/verify-payment-session",
  isAuthenticatedAny,
  verifyingPaymentSession,
);
router.get("/seller", isAuthenticated("seller"), isSeller, getSellerOrders);
router.get("/user", isAuthenticated("user"), isUser, getUserOrders);
router.patch(
  "/:orderId/status",
  isAuthenticated("seller"),
  isSeller,
  updateDeliveryStatus,
);

router.put("/verify-coupon", isAuthenticatedAny, verifyCouponCode);

router.get("/:id", isAuthenticatedAny, getOrderDetails);

export default router;
