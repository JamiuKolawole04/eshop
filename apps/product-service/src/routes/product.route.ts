import express, { Router } from "express";

import { isAuthenticated, isSeller } from "@packages/middleware";

import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopProducts,
  restoreProduct,
  searchProducts,
  topShops,
  uploadProductImage,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.post("/", isAuthenticated, isSeller, createProduct);
router.get("/", getAllProducts);

router.get("/shop-products", isAuthenticated, isSeller, getShopProducts);

router.delete("/:productId", isAuthenticated, isSeller, deleteProduct);
router.patch("/:productId/restore", isAuthenticated, isSeller, restoreProduct);

router.get("/categories", getCategories);

router.post("/discount-code", isAuthenticated, isSeller, createDiscountCode);
router.get("/discount-code", isAuthenticated, getDiscountCodes);
router.delete(
  "/discount-code/:id",
  isAuthenticated,
  isSeller,
  deleteDiscountCode,
);
router.post("/product-image", isAuthenticated, isSeller, uploadProductImage);
router.delete("/product-image", isAuthenticated, isSeller, deleteProductImage);

router.get("/events/offers", getFilteredEvents);
router.get("/shops/filtered", getFilteredShops);
router.get("/shops/top", topShops);
router.get("/filtered-products", getFilteredProducts);
router.get("/search-products", searchProducts);

router.get("/:slug", getProductDetails);

export default router;
