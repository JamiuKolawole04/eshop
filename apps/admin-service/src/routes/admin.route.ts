import express, { Router } from "express";

import { isAdmin, isAuthenticated } from "@packages/middleware";
import {
  addNewAdmin,
  getAdmin,
  getAllAdmins,
  getAllCustomizations,
  getAllEvents,
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
router.get("/events", isAuthenticated("admin"), isAdmin, getAllEvents);
router.get("/admins", isAuthenticated("admin"), isAdmin, getAllAdmins);
router.put("/add-new-admin", isAuthenticated("admin"), isAdmin, addNewAdmin);
router.get(
  "/customizations",
  isAuthenticated("admin"),
  isAdmin,
  getAllCustomizations,
);

export default router;
