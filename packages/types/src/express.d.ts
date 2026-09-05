import { Sellers, Shops, Users } from "@packages/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: Users | null;
      seller?: (Sellers & { shop: Shops | null }) | null;
      role?: "user" | "seller" | "admin";
    }
  }
}

export {};
