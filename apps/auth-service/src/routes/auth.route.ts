import express, { Router } from "express";

import { login, userRegistration, verifyUser } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login", login);

export default router;
