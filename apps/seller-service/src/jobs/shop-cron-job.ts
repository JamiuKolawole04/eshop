import cron from "node-cron";

import { imageKit } from "@packages/imagekit";
import { prisma } from "@packages/prisma";
import { DEFAULT_SHOP_FILE_IDS } from "../constants/shop.constants";

const RESTORE_WINDOW_DAYS = 28;
const RESTORE_WINDOW_MS = RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * ImageKit files owned by a shop that is about to be purged.
 *
 * The default avatar/banner are shared by every shop, so they are always
 * excluded. Duplicates are collapsed in case the same file is referenced by
 * both the shop and one of its products.
 */
const collectShopFileIds = (
  shop: { avatarFileId: string; coverBannerFileId: string },
  imageFileIds: string[],
) => {
  const fileIds = new Set<string>();

  for (const fileId of [
    shop.avatarFileId,
    shop.coverBannerFileId,
    ...imageFileIds,
  ]) {
    if (fileId && !DEFAULT_SHOP_FILE_IDS.has(fileId)) {
      fileIds.add(fileId);
    }
  }

  return [...fileIds];
};

/**
 * ImageKit cleanup is best-effort: a failed delete must never prevent the
 * remaining files (or shops) from being processed.
 */
const deleteShopFiles = async (shopId: string, fileIds: string[]) => {
  await Promise.all(
    fileIds.map(async (fileId) => {
      try {
        await imageKit.files.delete(fileId);
      } catch (error) {
        console.error(
          `Failed to delete ImageKit file ${fileId} for shop ${shopId}:`,
          error,
        );
      }
    }),
  );
};

export const purgeExpiredShops = async () => {
  const cutoff = new Date(Date.now() - RESTORE_WINDOW_MS);

  const expiredShops = await prisma.shops.findMany({
    where: {
      isDeleted: true,
      deletedAt: { lte: cutoff },
    },
    select: {
      id: true,
      avatarFileId: true,
      coverBannerFileId: true,
    },
  });

  for (const shop of expiredShops) {
    const { id: shopId } = shop;

    try {
      const [products, orders] = await Promise.all([
        prisma.products.findMany({
          where: { shopId },
          select: { id: true },
        }),
        prisma.orders.findMany({
          where: { shopId },
          select: { id: true },
        }),
      ]);

      const productIds = products.map(({ id }) => id);
      const orderIds = orders.map(({ id }) => id);

      // Read the ImageKit references before their rows are removed below.
      const images = await prisma.images.findMany({
        where: {
          OR: [{ shopId }, { productId: { in: productIds } }],
        },
        select: { file_id: true },
      });

      const fileIds = collectShopFileIds(
        shop,
        images.map(({ file_id }) => file_id),
      );

      // MongoDB uses Prisma's emulated referential integrity, so required
      // relations (products, orders, followers) must be removed before the
      // shop itself can be deleted.
      await prisma.$transaction([
        prisma.oderItems.deleteMany({
          where: { orderId: { in: orderIds } },
        }),
        prisma.orders.deleteMany({ where: { shopId } }),
        prisma.images.deleteMany({
          where: {
            OR: [{ shopId }, { productId: { in: productIds } }],
          },
        }),
        prisma.products.deleteMany({ where: { shopId } }),
        prisma.followers.deleteMany({ where: { shopId } }),
        prisma.shopReviews.deleteMany({ where: { shopId } }),
        prisma.shops.delete({ where: { id: shopId } }),
      ]);

      // Only touch ImageKit once the shop is actually gone, so a failed purge
      // never leaves a live shop with missing images.
      await deleteShopFiles(shopId, fileIds);
    } catch (error) {
      console.error(`Failed to purge shop ${shopId}:`, error);
    }
  }
};

cron.schedule("0 * * * *", () => {
  purgeExpiredShops().catch((error) => console.error(error));
});
