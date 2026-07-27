import { NextFunction, Request, Response } from "express";
import { hash, compare } from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

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
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      throw new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AuthError("Forbidden! User/Seller not found.");
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      String(process.env.ACCESS_TOKEN_SECRET),
      { expiresIn: "15m" },
    );

    setCookie(res, "access_token", newAccessToken);

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
