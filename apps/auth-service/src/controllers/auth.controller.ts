import { NextFunction, Request, Response } from "express";

import { validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  validateRegistrationData(req.body, "user");

  const { email, password } = req.body;
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });
};
