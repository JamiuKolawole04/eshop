import { NextFunction, Request, Response } from "express";
import { hash, compare } from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";

import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import { Prisma, prisma, Sellers, Shops, Users } from "@packages/prisma";
import {
  AuthError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { setCookie } from "@packages/cookies";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: "2026-06-24.dahlia",
});

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError("User already exists.");
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "user-activation-email");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = async (
  req: Request<
    Record<string, string>,
    Record<string, string>,
    Partial<Users & { otp: string }>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      throw new ValidationError("All fields are required.");
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError("User already exists.");
    }

    await verifyOtp(email, otp);
    const hashedPassword = await hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required."));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new AuthError("Invalid credentials");
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new AuthError("Invalid credentials.");
    }

    res.clearCookie("seller_access_token");
    res.clearCookie("seller_refresh_token");

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      String(process.env.ACCESS_TOKEN_SECRET),
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      String(process.env.REFRESH_TOKEN_SECRET),
      { expiresIn: "7d" },
    );

    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const refreshToken = req.cookies.refresh_token;

    const refreshToken =
      req.cookies.refresh_token ||
      req.cookies.seller_refresh_token ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      throw new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: "user" | "seller" };

    if (!decoded || !decoded.id || !decoded.role) {
      throw new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      throw new AuthError("Forbidden! User/Seller not found.");
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      String(process.env.ACCESS_TOKEN_SECRET),
      { expiresIn: "15m" },
    );

    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller_access_token", newAccessToken);
    }

    req.role = decoded.role;

    res.status(200).json({
      message: "Refresh token successful",
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, "user");
};

export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new ValidationError("Email and new password are required.");
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const isSamePassword = await compare(newPassword, user.password || "");
    if (isSamePassword) {
      throw new ValidationError(
        "New password cannot be the same as the current password.",
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message:
        "Password reset successfully! Please login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

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

export const updateUserPassword = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError("all fields are required"));
    }

    if (newPassword !== confirmPassword) {
      return next(new ValidationError("new passwords do not match"));
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the current password",
        ),
      );
    }
  } catch (err) {
    next(err);
  }
};

export const userLogout = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({
      success: true,
      message: "user logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "seller");

    const { name, email } = req.body;
    const existingSeller = await prisma.users.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ConflictError("Seller already exists.");
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "seller-activation-email");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

export const verifySeller = async (
  req: Request<
    Record<string, string>,
    Record<string, string>,
    Partial<Sellers & { otp: string }>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      throw new ValidationError("All fields are required.");
    }

    const existingUser = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError("Seller already exists.");
    }

    await verifyOtp(email, otp);
    const hashedPassword = await hash(password, 10);

    await prisma.sellers.create({
      data: { name, email, password: hashedPassword, phone_number, country },
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

export const createShop = async (
  req: Request<Record<string, string>, Record<string, string>, Partial<Shops>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !category || !opening_hours || !sellerId) {
      throw new ValidationError("All fields are required.");
    }

    const shopData: Prisma.ShopsUncheckedCreateInput = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      message: "Shop created successfully.",
      shop,
    });
  } catch (err) {
    next(err);
  }
};

export const createtripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      throw new ValidationError("Seller ID is required.");
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      throw new ValidationError("Seller with this id does ");
    }

    const account: Stripe.Account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (err) {
    next(err);
  }
};

export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required."));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller || !seller.password) {
      throw new AuthError("Invalid credentials");
    }

    const isMatch = await compare(password, seller.password);
    if (!isMatch) {
      throw new AuthError("Invalid credentials.");
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const accessToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      String(process.env.ACCESS_TOKEN_SECRET),
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      String(process.env.REFRESH_TOKEN_SECRET),
      { expiresIn: "7d" },
    );

    setCookie(res, "seller_access_token", accessToken);
    setCookie(res, "seller_refresh_token", refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({
      success: true,
      message: "admin logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const addUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new NotFoundError("Address not found or unauthorized"));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
