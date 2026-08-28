import express, { Router } from "express";

import { isAuthenticated } from "@packages/middleware";
import {
  addUserAddress,
  deleteUserAddress,
  getAdmin,
  getUser,
  getUserAddresses,
} from "../controllers/user.controller";

const router: Router = express.Router();

router.post("/users/shipping-address", isAuthenticated, addUserAddress);
router.get("/users/shipping-address", isAuthenticated, getUserAddresses);
router.delete(
  "/users/shipping-address/:addressId",
  isAuthenticated,
  deleteUserAddress,
);

router.get("/auth/users/profile", isAuthenticated, getUser);

router.get("/admin/profile", isAuthenticated, getAdmin);

export default router;
