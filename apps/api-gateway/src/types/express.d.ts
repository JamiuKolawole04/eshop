import { Users } from "@packages/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: Users;
    }
  }
}

export {};
