import express, { Router } from "express";

import { isAdmin, isAuthenticated } from "@packages/middleware";
import { getAdmin } from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/profile", isAuthenticated("admin"), isAdmin, getAdmin);

export default router;
