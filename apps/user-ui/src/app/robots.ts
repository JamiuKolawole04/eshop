import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/constants/site";

const PRIVATE_PATHS = [
  "/api/",
  "/profile",
  "/cart",
  "/checkout",
  "/order",
  "/payment-success",
  "/inbox",
  "/wishlist",
  "/login",
  "/signup",
  "/forgot-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
