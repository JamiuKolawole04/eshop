import { Response } from "express";

export function cookies(): string {
  return "cookies";
}

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
  });
};

export const setSessionFlag = (res: Response) => {
  res.cookie("has_session", "1", {
    httpOnly: false, // must be readable by JS
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
  });
};

export const clearSessionFlag = (res: Response) => {
  res.clearCookie("has_session", { path: "/" });
};
