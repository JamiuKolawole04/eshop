import { Request, Response, NextFunction } from "express";

import { AuthError } from "@packages/error-handler";

export const isSeller = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    throw new AuthError("Access denied: Seller only");
  }

  next();
};

export const isUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    throw new AuthError("Access denied: User only");
  }

  next();
};
