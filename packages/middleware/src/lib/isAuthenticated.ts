import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "@packages/prisma";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized! Token missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      String(process.env.ACCESS_TOKEN_SECRET),
    ) as { id: string; role: "user" | "seller" };

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!account) {
      return res.status(401).json({
        message: "Account not found!",
      });
    }

    (req as Request & { user: typeof account }).user = account;

    return next();
  } catch {
    res.status(401).json({
      message: "Unauthorized! Token expired or invalid token.",
    });
  }
};
