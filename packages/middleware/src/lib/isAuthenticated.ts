import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "@packages/prisma";
import { AuthRole, cookieNameByRole } from "@packages/cookies";

export const isAuthenticated = (expectedRole: AuthRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookieName = cookieNameByRole[expectedRole];
      const token =
        req.cookies[cookieName] || req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Unauthorized! Token missing.",
        });
      }

      const decoded = jwt.verify(
        token,
        String(process.env.ACCESS_TOKEN_SECRET),
      ) as { id: string; role: AuthRole };

      if (!decoded || decoded.role !== expectedRole) {
        return res.status(401).json({
          message: "Unauthorized! Invalid token.",
        });
      }

      let account;
      if (decoded.role === "user") {
        account = await prisma.users.findUnique({
          where: { id: decoded.id },
          include: {
            avatar: true,
          },
        });
        req.user = account;
      } else if (decoded.role === "seller") {
        account = await prisma.sellers.findUnique({
          where: { id: decoded.id },
          include: { shop: true },
        });
        req.seller = account;
      } else if (decoded.role === "admin") {
        account = await prisma.users.findUnique({
          where: { id: decoded.id },
          include: {
            avatar: true,
          },
        });
        req.user = account;
      }

      if (!account) {
        return res.status(401).json({
          message: "Account not found",
        });
      }

      if (
        decoded.role === "user" &&
        (account as { banned?: boolean | null }).banned
      ) {
        return res.status(403).json({
          message: "Account is banned.",
        });
      }

      req.role = decoded.role;
      return next();
    } catch {
      res.status(401).json({
        message: "Unauthorized! Token expired or invalid token.",
      });
    }
  };
};
export const isAuthenticatedAny = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      Object.values(cookieNameByRole)
        .map((name) => req.cookies[name])
        .find(Boolean) || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized! Token missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      String(process.env.ACCESS_TOKEN_SECRET),
    ) as { id: string; role: AuthRole };

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account;
    } else if (decoded.role === "admin") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    }

    if (!account) {
      return res.status(401).json({
        message: "Account not found",
      });
    }

    if (
      decoded.role === "user" &&
      (account as { banned?: boolean | null }).banned
    ) {
      return res.status(403).json({
        message: "Account is banned.",
      });
    }

    req.role = decoded.role;
    return next();
  } catch {
    res.status(401).json({
      message: "Unauthorized! Token expired or invalid token.",
    });
  }
};
