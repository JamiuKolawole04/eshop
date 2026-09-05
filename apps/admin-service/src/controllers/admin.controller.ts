import { NextFunction, Request, Response } from "express";

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
