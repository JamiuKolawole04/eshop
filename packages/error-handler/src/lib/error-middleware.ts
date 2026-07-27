/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "./error-handler.js";

export const ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    console.log(`JWT Error ${req.method} ${req.url} - ${err.message}`);
    return res.status(401).json({
      status: "error",
      message: err.message,
      ...(err.cause ? { details: err.cause } : {}),
    });
  }

  console.log("Unhandled error", err);
  return res
    .status(500)
    .json({ message: "Something went wrong, please try again later" });
};
