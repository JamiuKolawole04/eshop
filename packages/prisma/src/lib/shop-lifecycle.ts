import { prisma } from "./prisma.js";
import type { Prisma } from "./generated/client.js";

export const DEFAULT_SHOP_AVATAR_FILE_ID = "6a8078ae5c7cd75eb81f31dc";
export const DEFAULT_SHOP_COVER_BANNER_FILE_ID = "6a8f875d5c7cd75eb81ddeaa";

export const DEFAULT_SHOP_FILE_IDS: ReadonlySet<string> = new Set([
  DEFAULT_SHOP_AVATAR_FILE_ID,
  DEFAULT_SHOP_COVER_BANNER_FILE_ID,
]);

type ShopFileRefs = {
  avatarFileId: string | null;
  coverBannerFileId: string | null;
};

function collectShopFileIds(
  shop: ShopFileRefs,
  imageFileIds: string[],
): string[] {
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
}

export async function deleteSellerAccount(
  sellerId: string,
): Promise<{ fileIds: string[] }> {
  const seller = await prisma.sellers.findUnique({
    where: { id: sellerId },
    select: { id: true, shopId: true },
  });

  if (!seller) {
    return { fileIds: [] };
  }

  const shopId = seller.shopId;

  let shopFileIds: string[] = [];
  const productIds: string[] = [];
  const orderIds: string[] = [];

  if (shopId) {
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true, avatarFileId: true, coverBannerFileId: true },
    });

    if (shop) {
      const [products, orders] = await Promise.all([
        prisma.products.findMany({ where: { shopId }, select: { id: true } }),
        prisma.orders.findMany({ where: { shopId }, select: { id: true } }),
      ]);

      productIds.push(...products.map(({ id }) => id));
      orderIds.push(...orders.map(({ id }) => id));

      const images = await prisma.images.findMany({
        where: {
          OR: [{ shopId }, { productId: { in: productIds } }],
        },
        select: { file_id: true },
      });

      shopFileIds = collectShopFileIds(
        shop,
        images.map(({ file_id }) => file_id),
      );
    }
  }

  const conversations = await prisma.conversationGroup.findMany({
    where: {
      isGroup: false,
      participantIds: { has: sellerId },
    },
    select: { id: true },
  });

  const conversationIds = conversations.map(({ id }) => id);

  const ops: Prisma.PrismaPromise<unknown>[] = [];

  if (shopId) {
    if (orderIds.length > 0) {
      ops.push(
        prisma.oderItems.deleteMany({
          where: { orderId: { in: orderIds } },
        }),
      );
    }

    ops.push(
      prisma.orders.deleteMany({ where: { shopId } }),
      prisma.images.deleteMany({
        where: { OR: [{ shopId }, { productId: { in: productIds } }] },
      }),
      prisma.productAnalytics.deleteMany({ where: { shopId } }),
      prisma.shopAnalytics.deleteMany({ where: { shopId } }),
      prisma.uniqueShopVisitors.deleteMany({ where: { shopId } }),
      prisma.products.deleteMany({ where: { shopId } }),
      prisma.followers.deleteMany({ where: { shopId } }),
      prisma.shopReviews.deleteMany({ where: { shopId } }),
      prisma.shops.delete({ where: { id: shopId } }),
    );
  }

  ops.push(
    prisma.discount_codes.deleteMany({ where: { sellerId } }),
    prisma.notifications.deleteMany({
      where: { OR: [{ receiverId: sellerId }, { creatorId: sellerId }] },
    }),
    prisma.sellers.delete({ where: { id: sellerId } }),
  );

  if (conversationIds.length > 0) {
    ops.push(
      prisma.message.deleteMany({
        where: { conversationId: { in: conversationIds } },
      }),
      prisma.participant.deleteMany({
        where: { conversationId: { in: conversationIds } },
      }),
      prisma.conversationGroup.deleteMany({
        where: { id: { in: conversationIds } },
      }),
    );
  }

  await prisma.$transaction(ops);

  return { fileIds: shopFileIds };
}
