import cron from "node-cron";

import { imageKit } from "@packages/imagekit";
import { prisma } from "@packages/prisma";

const deleteProductFiles = async (fileIds: string[]) => {
  await Promise.all(
    fileIds.map(async (fileId) => {
      try {
        await imageKit.files.delete(fileId);
      } catch (error) {
        console.error(`Failed to delete ImageKit file ${fileId}:`, error);
      }
    }),
  );
};

export const purgeExpiredProducts = async () => {
  const now = new Date();

  const products = await prisma.products.findMany({
    where: {
      isDeleted: true,
      deletedAt: { lte: now },
    },
    select: { id: true },
  });

  if (products.length === 0) {
    return;
  }

  const productIds = products.map(({ id }) => id);

  const images = await prisma.images.findMany({
    where: { productId: { in: productIds } },
    select: { file_id: true },
  });

  const fileIds = [
    ...new Set(
      images.map(({ file_id }) => file_id).filter((fileId) => Boolean(fileId)),
    ),
  ];

  await prisma.$transaction([
    prisma.images.deleteMany({ where: { productId: { in: productIds } } }),
    prisma.products.deleteMany({ where: { id: { in: productIds } } }),
  ]);

  await deleteProductFiles(fileIds);
};

cron.schedule("0 * * * *", () => {
  purgeExpiredProducts().catch((error) => console.error(error));
});
