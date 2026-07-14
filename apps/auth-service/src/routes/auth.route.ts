import express, { Router } from "express";

import { login, resetUserPassword, userForgotPassword, userRegistration, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/auth/users/register", userRegistration);
router.post("/auth/users/verify", verifyUser);
router.post("/auth/users/login", login);
router.post("/auth/users/forgot-password", userForgotPassword);
router.post("/auth/users/verify-forgot-password", verifyUserForgotPassword);
router.post("/auth/users/reset-password", resetUserPassword);

export default router;
