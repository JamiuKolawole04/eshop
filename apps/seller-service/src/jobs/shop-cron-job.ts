import cron from "node-cron";

import { prisma } from "@packages/prisma";
import { deleteImageKitFiles } from "@packages/imagekit";
import { deleteSellerAccount } from "@packages/prisma";

const RESTORE_WINDOW_DAYS = 28;
const RESTORE_WINDOW_MS = RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export const purgeExpiredShops = async () => {
  const cutoff = new Date(Date.now() - RESTORE_WINDOW_MS);

  const expiredSellers = await prisma.sellers.findMany({
    where: {
      shop: {
        isDeleted: true,
        deletedAt: { lte: cutoff },
      },
    },
    select: {
      id: true,
    },
  });

  for (const seller of expiredSellers) {
    const { id: sellerId } = seller;

    try {
      const { fileIds } = await deleteSellerAccount(sellerId);

      if (fileIds.length > 0) {
        await deleteImageKitFiles(
          fileIds,
          `expired seller ${sellerId} (cron job)`,
        );
      }
    } catch (error) {
      console.error(`Failed to purge seller ${sellerId}:`, error);
    }
  }
};

cron.schedule("0 * * * *", () => {
  purgeExpiredShops().catch((error) => console.error(error));
});
