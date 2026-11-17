import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/constants/site";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URI?.replace(/\/+$/, "");
const FETCH_TIMEOUT_MS = 4000;

export const revalidate = 3600;

type ProductsResponse = {
  products?: Array<{ slug?: string; updatedAt?: string }>;
};

type ShopsResponse = {
  shops?: Array<{ id?: string; updatedAt?: string }>;
};

async function getJson<T>(path: string): Promise<T | null> {
  if (!API_URL) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (compatible; EShopSitemap/1.0; +https://www.eshopstore.com.ng)",
      },
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: `${SITE_URL}/`,
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_URL}/products`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/offers`,
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/shops`,
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/privacy-policy`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/terms`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    ...route,
    lastModified: now,
  }));

  const [products, shops] = await Promise.all([
    getJson<ProductsResponse>("/api/products?page=1&limit=100"),
    getJson<ShopsResponse>(
      "/api/products/shops/top?page=1&limit=100&type=latest",
    ),
  ]);

  for (const product of products?.products ?? []) {
    if (!product.slug) continue;

    entries.push({
      url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const shop of shops?.shops ?? []) {
    if (!shop.id) continue;

    entries.push({
      url: `${SITE_URL}/shop/${encodeURIComponent(shop.id)}`,
      lastModified: shop.updatedAt ? new Date(shop.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
