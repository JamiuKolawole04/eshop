import express, { Router } from "express";

import { isAdmin, isAuthenticated } from "@packages/middleware";
import {
  addNewAdmin,
  getAdmin,
  getAllAdmins,
  getAllCustomizations,
  getAllEvents,
  getAllProductsForAdmin,
  getAllSellers,
  getAllUsers,
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
router.get("/all", isAuthenticated("admin"), isAdmin, getAllAdmins);
router.post("/", isAuthenticated("admin"), isAdmin, addNewAdmin);
router.get("/customizations", getAllCustomizations);
router.get("/users", isAuthenticated("admin"), isAdmin, getAllUsers);
router.get("/sellers", isAuthenticated("admin"), isAdmin, getAllSellers);

export default router;
