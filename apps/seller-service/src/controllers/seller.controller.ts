import { NextFunction, Request, Response } from "express";

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { prisma } from "@packages/prisma";
import { imageKit } from "@packages/imagekit";

export const getSellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const baseFilter = {
      shopId,
      OR: [
        { starting_date: null },
        { starting_date: { isSet: false } },
        { ending_date: null },
        { ending_date: { isSet: false } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        where: baseFilter,
        orderBy: { createdAt: "desc" },
      }),
      prisma.products.count({
        where: baseFilter,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      products,
      total,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      shopId,
      AND: [
        { starting_date: { not: null } },
        { starting_date: { isSet: true } },
        { ending_date: { not: null } },
        { ending_date: { isSet: true } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        where: baseFilter,
        orderBy: { createdAt: "desc" },
      }),
      prisma.products.count({
        where: baseFilter,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      products,
      total,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const followShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { shopId } = req.body;

    if (!shopId) {
      throw new ValidationError("shopId is required");
    }

    const existing = await prisma.followers.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Already following this shop");
    }

    await prisma.$transaction([
      prisma.followers.create({
        data: {
          userId,
          shopId,
        },
      }),
      prisma.users.update({
        where: { id: userId },
        data: {
          following: {
            push: shopId,
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Shop followed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { shopId } = req.body;

    if (!shopId) {
      throw new ValidationError("shopId is required");
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { following: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.$transaction([
      prisma.followers.delete({
        where: {
          userId_shopId: {
            userId,
            shopId,
          },
        },
      }),
      prisma.users.update({
        where: { id: userId },
        data: {
          following: {
            set: user.following.filter((id) => id !== shopId),
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Shop unfollowed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const isFollowingShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { shopId } = req.params;

    if (!shopId) {
      throw new ValidationError("shopId is required");
    }

    const existing = await prisma.followers.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });

    res.status(200).json({
      success: true,
      isFollowing: !!existing,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const [shop, followersCount] = await Promise.all([
      prisma.shops.findUnique({
        where: { id },
      }),
      prisma.followers.count({
        where: { shopId: id },
      }),
    ]);

    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    res.status(200).json({
      success: true,
      shop,
      followersCount,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadShopAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;
    const sellerId = req.seller?.id;

    if (!fileName) {
      throw new ValidationError("file is required!");
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (!shop) {
      throw new NotFoundError("Shop not found!");
    }

    const response = await imageKit.files.upload({
      file: fileName,
      fileName: `shop-avatar-${Date.now()}.jpg`,
      folder: "/eshop-products",
    });

    const DEFAULT_AVATAR_FILE_ID = "6a8078ae5c7cd75eb81f31dc";
    if (shop.avatarFileId && shop.avatarFileId !== DEFAULT_AVATAR_FILE_ID) {
      try {
        await imageKit.files.delete(shop.avatarFileId);
      } catch (err) {
        console.log("Failed to delete old shop avatar:", err);
      }
    }

    const updatedShop = await prisma.shops.update({
      where: { sellerId },
      data: {
        avatar: response.url,
        avatarFileId: response.fileId,
      },
    });

    res.status(200).json({
      success: true,
      avatar: updatedShop.avatar,
      avatarFileId: updatedShop.avatarFileId,
    });
  } catch (error) {
    next(error);
  }
};
