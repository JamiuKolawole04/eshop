import express, { Router } from "express";

import { isAuthenticated, isSeller } from "@packages/middleware";

import {
  createDiscountCode,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.get("/categories", getCategories);
router.post("/discount-code", isAuthenticated, isSeller, createDiscountCode);
router.get("/discount-code", isAuthenticated, getDiscountCodes);
router.delete(
  "/discount-code/:id",
  isAuthenticated,
  isSeller,
  deleteDiscountCode,
);

export default router;
