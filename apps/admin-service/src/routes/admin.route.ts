import express, { Router } from "express";

import { isAuthenticated } from "@packages/middleware";

const router: Router = express.Router();

export default router;
