import { Response } from "express";

export function cookies(): string {
  return "cookies";
}

export type AuthRole = "user" | "seller" | "admin";

export const isAuthRole = (value: unknown): value is AuthRole =>
  value === "user" || value === "seller" || value === "admin";

export const cookieNameByRole: Record<AuthRole, string> = {
  user: "access_token",
  seller: "seller_access_token",
  admin: "admin_access_token",
};

export const refreshCookieNameByRole: Record<AuthRole, string> = {
  user: "refresh_token",
  seller: "seller_refresh_token",
  admin: "admin_refresh_token",
};

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
