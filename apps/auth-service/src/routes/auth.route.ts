import express, { Router } from "express";

import {
  adminLogout,
  createShop,
  createtripeConnectLink,
  getSeller,
  login,
  loginAdmin,
  refreshToken,
  registerSeller,
  resetUserPassword,
  sellerLogin,
  sellerLogout,
  userForgotPassword,
  userLogout,
  userRegistration,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import { isAuthenticated, isSeller } from "@packages/middleware";
import { authLimiter, refreshLimiter } from "@packages/middleware/rate-limit";

const router: Router = express.Router();

router.post("/auth/users/register", authLimiter, userRegistration);
router.post("/auth/users/verify", authLimiter, verifyUser);
router.post("/auth/users/login", authLimiter, login);
router.post("/auth/users/forgot-password", authLimiter, userForgotPassword);
router.post(
  "/auth/users/verify-forgot-password",
  authLimiter,
  verifyUserForgotPassword,
);
router.post("/auth/users/reset-password", authLimiter, resetUserPassword);
router.post("/auth/users/logout", isAuthenticated("user"), userLogout);

router.post("/auth/refresh-token", refreshLimiter, refreshToken);

router.post("/auth/sellers/register", authLimiter, registerSeller);
router.post("/auth/sellers/verify", authLimiter, verifySeller);
router.post("/auth/sellers/login", authLimiter, sellerLogin);
router.get(
  "/auth/sellers/profile",
  isAuthenticated("seller"),
  isSeller,
  getSeller,
);
router.post(
  "/auth/sellers/logout",
  isAuthenticated("seller"),
  isSeller,
  sellerLogout,
);

router.post("/auth/admin/login", authLimiter, loginAdmin);
router.post("/auth/admin/logout", isAuthenticated("admin"), adminLogout);

router.post("/shop", createShop);
router.post("/stripe", createtripeConnectLink);

export default router;
