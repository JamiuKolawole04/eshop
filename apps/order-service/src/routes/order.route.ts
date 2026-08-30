import express, { Router } from "express";

import {
  createPaymentIntent,
  createPaymentSession,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import { isAuthenticated } from "@packages/middleware";

const router: Router = express.Router();

router.post("/payment-intent", isAuthenticated, createPaymentIntent);
router.post("/payment-session", isAuthenticated, createPaymentSession);
router.get("/verify-payment-session", isAuthenticated, verifyingPaymentSession);

export default router;
