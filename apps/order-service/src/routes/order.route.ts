import express, { Router } from "express";

import {
  collectCashPayment,
  collectCashPaymentAdmin,
  createCashOnDeliveryOrder,
  createPaymentIntent,
  createPaymentSession,
  createPaystackPayment,
  getAdminRevenue,
  getAllOrdersForAdmin,
  getCashOnDeliveryEligibility,
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
router.post(
  "/paystack-payment",
  isAuthenticated("user"),
  isUser,
  createPaystackPayment,
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

router.get("/cash-on-delivery/eligibility", getCashOnDeliveryEligibility);
router.post(
  "/cash-on-delivery",
  isAuthenticated("user"),
  isUser,
  createCashOnDeliveryOrder,
);

router.patch(
  "/admin/:orderId/collect-cash",
  isAuthenticated("admin"),
  isAdmin,
  collectCashPaymentAdmin,
);
router.patch(
  "/:orderId/collect-cash",
  isAuthenticated("seller"),
  isSeller,
  collectCashPayment,
);
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
router.get(
  "/admin/revenue",
  isAuthenticated("admin"),
  isAdmin,
  getAdminRevenue,
);

router.put("/verify-coupon", verifyCouponCode);

router.get("/:id", isAuthenticatedAny, getOrderDetails);

export default router;
