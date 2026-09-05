import express, { Router } from "express";

import {
  isAuthenticated,
  isSeller,
  isAuthenticatedAny,
} from "@packages/middleware";

import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
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

router.post("/", isAuthenticated("seller"), isSeller, createProduct);
router.get("/", getAllProducts);

router.get(
  "/shop-products",
  isAuthenticated("seller"),
  isSeller,
  getShopProducts,
);

router.delete(
  "/:productId",
  isAuthenticated("seller"),
  isSeller,
  deleteProduct,
);
router.patch(
  "/:productId/restore",
  isAuthenticated("seller"),
  isSeller,
  restoreProduct,
);

router.get("/categories", getCategories);

router.post(
  "/discount-code",
  isAuthenticated("seller"),
  isSeller,
  createDiscountCode,
);
router.get("/discount-code", isAuthenticatedAny, getDiscountCodes);
router.delete(
  "/discount-code/:id",
  isAuthenticated("seller"),
  isSeller,
  deleteDiscountCode,
);
router.post(
  "/product-image",
  isAuthenticated("seller"),
  isSeller,
  uploadProductImage,
);
router.delete(
  "/product-image",
  isAuthenticated("seller"),
  isSeller,
  deleteProductImage,
);

router.get("/events/offers", getFilteredEvents);
router.get("/events/all", getAllEvents);

router.get("/shops/filtered", getFilteredShops);
router.get("/shops/top", topShops);
router.get("/filtered-products", getFilteredProducts);
router.get("/search-products", searchProducts);

router.get("/:slug", getProductDetails);

export default router;
