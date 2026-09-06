import express, { Router } from "express";

import { isAdmin, isAuthenticated } from "@packages/middleware";
import {
  getAdmin,
  getAllProductsForAdmin,
} from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/profile", isAuthenticated("admin"), isAdmin, getAdmin);
router.get(
  "/products",
  isAuthenticated("admin"),
  isAdmin,
  getAllProductsForAdmin,
);

export default router;
