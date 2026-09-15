import express, { Router } from "express";

import { getSellerProducts } from "../controllers/seller.controller";

const router: Router = express.Router();

router.get("/shops/:shopId/products", getSellerProducts);

export default router;
