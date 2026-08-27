import express, { Router } from "express";

import {
  createShop,
  createtripeConnectLink,
  getSeller,
  getUser,
  login,
  refreshToken,
  registerSeller,
  resetUserPassword,
  sellerLogin,
  userForgotPassword,
  userLogout,
  userRegistration,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import { isAuthenticated, isSeller } from "@packages/middleware";

const router: Router = express.Router();

router.post("/auth/users/register", userRegistration);
router.post("/auth/users/verify", verifyUser);
router.post("/auth/users/login", login);
router.post("/auth/users/forgot-password", userForgotPassword);
router.post("/auth/users/verify-forgot-password", verifyUserForgotPassword);
router.post("/auth/users/reset-password", resetUserPassword);
router.get("/auth/users/profile", isAuthenticated, getUser);
router.get("/auth/users/logout", isAuthenticated, userLogout);

router.post("/auth/refresh-token", refreshToken);

router.post("/auth/sellers/register", registerSeller);
router.post("/auth/sellers/verify", verifySeller);
router.post("/auth/sellers/login", sellerLogin);
router.get("/auth/sellers/profile", isAuthenticated, isSeller, getSeller);

router.post("/shop", createShop);
router.post("/stripe", createtripeConnectLink);

export default router;
