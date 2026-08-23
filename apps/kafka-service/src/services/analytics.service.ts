import { prisma } from "@packages/prisma";
import { Actions, EventQueue } from "../types";

export const updateUserAnalytics = async (event: EventQueue) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
    });

    let updatedActions = (existingData?.actions || []) as unknown as Actions[];
    const actionExists = updatedActions.some(
      (entry) =>
        entry.productId === event.productId && entry.action === event.action,
    );

    // always store product view action for recommendations
    if (event.action === "product_view") {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    } else if (
      ["add_to_wishlist", "add_to_cart"].includes(event.action) &&
      !actionExists
    ) {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    }
    // remove add_to_cart when remove_from_cart is triggered
    else if (event.action === "remove_from_cart") {
      updatedActions = updatedActions.filter(
        (entry) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_cart"
          ),
      );
    }
    // remove add_to_wishlist when remove_from_wishlist is triggered
    else if (event.action === "remove_from_wishlist") {
      updatedActions = updatedActions.filter(
        (entry) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_wishlist"
          ),
      );
    }

    if (updatedActions.length > 100) {
      updatedActions.shift();
    }

    const extraFields: Record<string, string> = {};

    if (event.country) {
      extraFields.country = event.country;
    }

    if (event.city) {
      extraFields.city = event.city;
    }

    if (event.device) {
      extraFields.device = event.device;
    }

    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });
  } catch (err) {
    console.error("Error storing user analytics", err);
  }
};

export const updateProductAnalytics = async (event: EventQueue) => {
  try {
    if (!event.productId) return;

    const updateFields: Record<string, unknown> = {};

    if (event.action === "product_view") {
      updateFields.views = { increment: 1 };
    }

    if (event.action === "add_to_cart") {
      updateFields.cartAdds = { increment: 1 };
    }

    if (event.action === "remove_from_cart") {
      updateFields.cartAdds = { decrement: 1 };
    }

    if (event.action === "add_to_wishlist") {
      updateFields.wishListAdds = { increment: 1 };
    }

    if (event.action === "remove_from_wishlist") {
      updateFields.wishListAdds = { decrement: 1 };
    }

    if (event.action === "purchase") {
      updateFields.purchases = { increment: 1 };
    }

    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastViewedAt: new Date(),
        ...updateFields,
      },
      create: {
        productId: event.productId,
        shopId: event?.shopId,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishListAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Error storing product analytics", err);
  }
};
