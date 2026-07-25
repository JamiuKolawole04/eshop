import express, { Router } from "express";

import {
  getUser,
  login,
  refreshToken,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import { isAuthenticated } from "@packages/middleware";


const router: Router = express.Router();

router.post("/auth/users/register", userRegistration);
router.post("/auth/users/verify", verifyUser);
router.post("/auth/users/login", login);
router.post("/auth/users/refresh-token", refreshToken);
router.post("/auth/users/forgot-password", userForgotPassword);
router.post("/auth/users/verify-forgot-password", verifyUserForgotPassword);
router.post("/auth/users/reset-password", resetUserPassword);

router.post("/auth/users/logged-in",isAuthenticated,  getUser);

export default router;
