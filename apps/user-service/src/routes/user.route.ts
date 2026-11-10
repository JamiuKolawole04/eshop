import express, { Router } from "express";

import { isAuthenticated, isUser } from "@packages/middleware";
import {
  addUserAddress,
  deleteUserAddress,
  getLayoutData,
  getUser,
  getUserAddresses,
  notifications,
  updateUserPassword,
  updateUserPhone,
} from "../controllers/user.controller";

const router: Router = express.Router();

router.post(
  "/shipping-address",
  isAuthenticated("user"),
  isUser,
  addUserAddress,
);
router.get(
  "/shipping-address",
  isAuthenticated("user"),
  isUser,
  getUserAddresses,
);
router.delete(
  "/shipping-address/:addressId",
  isAuthenticated("user"),
  isUser,
  deleteUserAddress,
);

router.get("/profile", isAuthenticated("user"), isUser, getUser);
router.patch("/password", isAuthenticated("user"), isUser, updateUserPassword);
router.patch("/phone", isAuthenticated("user"), isUser, updateUserPhone);
router.get("/notifications", isAuthenticated("user"), isUser, notifications);
router.get("/layouts", getLayoutData);

export default router;
