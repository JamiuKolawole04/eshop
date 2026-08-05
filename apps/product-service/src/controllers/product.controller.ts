import { NextFunction, Request, Response } from "express";

import { prisma } from "@packages/prisma";
import { NotFoundError } from "@packages/error-handler";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      throw new NotFoundError("Categories not found");
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};
