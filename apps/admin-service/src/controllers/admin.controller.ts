import { NextFunction, Request, Response } from "express";

import { prisma } from "@packages/prisma";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";

export const getAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    // await sendLog({
    //   type: "success",
    //   message: `Admin data retrieved ${user?.email}`,
    //   source: "auth-service",
    // });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProductsForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notEventFilter = {
      OR: [{ starting_date: null }, { starting_date: { isSet: false } }],
    };

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: notEventFilter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          starting_date: true,
          images: {
            select: { url: true },
            take: 1,
          },
          shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({
        where: notEventFilter,
      }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const isEventFilter = {
      starting_date: {
        not: null,
        isSet: true,
      },
    };

    const [events, totalEvents] = await Promise.all([
      prisma.products.findMany({
        where: isEventFilter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          starting_date: true,
          ending_date: true,
          images: {
            select: { url: true },
            take: 1,
          },
          shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({
        where: isEventFilter,
      }),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      success: true,
      data: events,
      meta: {
        totalEvents,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admins = await prisma.users.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    next(error);
  }
};

export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      throw new ValidationError("Email is required.");
    }

    if (!role) {
      throw new ValidationError("Role is required.");
    }

    const isUser = await prisma.users.findUnique({ where: { email } });
    if (!isUser) {
      throw new ValidationError("No user found with this email");
    }

    if (role !== "admin") {
      throw new ValidationError("Invalid role provided");
    }

    const updateRole = await prisma.users.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(201).json({
      success: true,
      updateRole,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomizations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || {},
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.users.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [sellers, totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
              avatar: true,
              address: true,
            },
          },
        },
      }),
      prisma.sellers.count(),
    ]);

    const totalPages = Math.ceil(totalSellers / limit);

    res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalSellers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addCategoryToCustomization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category } = req.body;

    if (!category || typeof category !== "string") {
      throw new ValidationError("Category is required and must be a string");
    }

    const config = await prisma.site_config.findFirst();

    if (!config) {
      throw new NotFoundError("Site config not found");
    }

    if (config.categories.includes(category)) {
      throw new ConflictError("Category already exists");
    }

    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories: {
          push: category,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Category added successfully",
      categories: updatedConfig.categories,
    });
  } catch (err) {
    return next(err);
  }
};

export const addSubCategoryToCustomization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, subCategory } = req.body;

    if (!category || !subCategory) {
      throw new ValidationError("Category and subCategory are required");
    }

    const config = await prisma.site_config.findFirst();

    if (!config) {
      throw new NotFoundError("Site config not found");
    }

    if (!config.categories.includes(category)) {
      throw new NotFoundError("Category does not exist");
    }

    const subCategories = config.subCategories as Record<string, string[]>;

    const existing = subCategories[category] || [];

    if (existing.includes(subCategory)) {
      throw new ConflictError("Subcategory already exists");
    }

    subCategories[category] = [...existing, subCategory];

    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        subCategories,
      },
    });

    res.status(200).json({
      success: true,
      message: "Subcategory added successfully",
      subCategories: updatedConfig.subCategories,
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: "admin",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      notifications,
    });
  } catch (error) {
    next(error);
  }
};
