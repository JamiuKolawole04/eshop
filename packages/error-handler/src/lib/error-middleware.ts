/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "./error-handler.js";

type BodyParserError = Error & { type?: string };

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

  const bodyError = err as BodyParserError;

  if (bodyError.type === "entity.too.large") {
    return res.status(413).json({
      status: "error",
      message: "The uploaded file is too large. Please choose a smaller image.",
    });
  }

  if (bodyError.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "Invalid request body.",
    });
  }

  console.log("Unhandled error", err);
  return res
    .status(500)
    .json({ message: "Something went wrong, please try again later" });
};
