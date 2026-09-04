import express, { Router } from "express";

import { isAuthenticated } from "@packages/middleware";
import {
  addUserAddress,
  deleteUserAddress,
  getAdmin,
  getUser,
  getUserAddresses,
  updateUserPassword,
} from "../controllers/user.controller";

const router: Router = express.Router();

router.post("/shipping-address", isAuthenticated, addUserAddress);
router.get("/shipping-address", isAuthenticated, getUserAddresses);
router.delete(
  "/shipping-address/:addressId",
  isAuthenticated,
  deleteUserAddress,
);

router.get("/profile", isAuthenticated, getUser);
router.patch("/password", isAuthenticated, updateUserPassword);

router.get("/admin/profile", isAuthenticated, getAdmin);

export default router;
