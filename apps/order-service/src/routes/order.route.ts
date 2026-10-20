import express, { Router } from "express";

import {
  createPaymentIntent,
  createPaymentSession,
  getAllOrdersForAdmin,
  getOrderDetails,
  getSellerOrders,
  getSellerRevenue,
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
  isAdmin,
} from "@packages/middleware";

const router: Router = express.Router();

router.post(
  "/payment-intent",
  isAuthenticated("user"),
  isUser,
  createPaymentIntent,
);
router.post(
  "/payment-session",
  isAuthenticated("user"),
  isUser,
  createPaymentSession,
);
router.get(
  "/verify-payment-session",
  isAuthenticated("user"),
  isUser,
  verifyingPaymentSession,
);
router.get("/seller", isAuthenticated("seller"), isSeller, getSellerOrders);
router.get(
  "/seller/revenue",
  isAuthenticated("seller"),
  isSeller,
  getSellerRevenue,
);
router.get("/user", isAuthenticated("user"), isUser, getUserOrders);
router.patch(
  "/:orderId/status",
  isAuthenticated("seller"),
  isSeller,
  updateDeliveryStatus,
);

router.get(
  "/admin/all",
  isAuthenticated("admin"),
  isAdmin,
  getAllOrdersForAdmin,
);

router.put("/verify-coupon", verifyCouponCode);

router.get("/:id", isAuthenticatedAny, getOrderDetails);

export default router;
