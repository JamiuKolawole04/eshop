import express, { Router } from "express";

import { isAdmin, isAuthenticated } from "@packages/middleware";
import {
  addCategoryToCustomization,
  addNewAdmin,
  addSubCategoryToCustomization,
  getAdmin,
  getAdminDeviceUsage,
  getAdminGeo,
  getAllAdmins,
  getAllCustomizations,
  getAllEvents,
  getAllNotifications,
  getAllProductsForAdmin,
  getAllSellers,
  getAllUsers,
  uploadSiteBanner,
  uploadSiteLogo,
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
router.get(
  "/notifications",
  isAuthenticated("admin"),
  isAdmin,
  getAllNotifications,
);
router.get(
  "/device-usage",
  isAuthenticated("admin"),
  isAdmin,
  getAdminDeviceUsage,
);

router.get("/geo", isAuthenticated("admin"), isAdmin, getAdminGeo);
router.post(
  "/add-category",
  isAuthenticated("admin"),
  isAdmin,
  addCategoryToCustomization,
);
router.post(
  "/add-sub-category",
  isAuthenticated("admin"),
  isAdmin,
  addSubCategoryToCustomization,
);

// ban users
router.post("/upload-logo", isAuthenticated("admin"), isAdmin, uploadSiteLogo);
router.post(
  "/upload-banner",
  isAuthenticated("admin"),
  isAdmin,
  uploadSiteBanner,
);
export default router;
