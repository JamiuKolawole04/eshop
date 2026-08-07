import express, { Router } from "express";

import { isAuthenticated, isSeller } from "@packages/middleware";

import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.post("/", isAuthenticated, isSeller, createProduct);
router.get("/categories", getCategories);
router.post("/discount-code", isAuthenticated, isSeller, createDiscountCode);
router.get("/discount-code", isAuthenticated, getDiscountCodes);
router.delete(
  "/discount-code/:id",
  isAuthenticated,
  isSeller,
  deleteDiscountCode,
);
router.post(
  "/upload-product-image",
  isAuthenticated,
  isSeller,
  uploadProductImage,
);

router.delete("/product-image", isAuthenticated, isSeller, deleteProductImage);

export default router;
