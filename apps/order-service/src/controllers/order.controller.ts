/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import crypto from "node:crypto";

import { Prisma, Users, prisma } from "@packages/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { redis } from "@packages/redis";
import { paystack } from "@packages/payment";
import { orderConfirmationQueue } from "../bullmq/email.queue";
import { sendLog } from "@packages/logs";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: "2026-06-24.dahlia",
});

export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  type Session = {
    id: string;
    quantity: string;
    sale_price: string;
    shopId: string;
    selectedOptions: object;
  };
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user?.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      throw new ValidationError("Cart is empty or invalid.");
    }

    const normalizedCart = JSON.stringify(
      (cart as Session[])
        .map((item) => ({
          id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    );

    const keys = await redis.keys("payment-session:*");

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);

        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            (session?.cart as Session[])
              ?.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a, b) => a.id.localeCompare(b.id)),
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    const uniqueShopsId = [...new Set(cart.map((item) => item.shopId))];

    const shopShares = cart.reduce<Record<string, number>>((acc, item) => {
      acc[item.shopId] =
        (acc[item.shopId] ?? 0) + item.quantity * item.sale_price;
      return acc;
    }, {});

    const shops = await prisma.shops.findMany({
      where: { id: { in: uniqueShopsId } },
      select: {
        id: true,
        sellerId: true,
        seller: {
          select: { stripeId: true, paystackSubaccountCode: true },
        },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop?.seller?.stripeId,
      paystackSubaccountCode: shop?.seller?.paystackSubaccountCode ?? null,
      amount: shopShares[shop.id] ?? 0,
    }));

    const totalAmount = cart.reduce((total, item) => {
      return total + item.quantity * item.sale_price;
    }, 0);

    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600, // 10 minutes
      JSON.stringify(sessionData),
    );

    return res.status(201).json({ sessionId });
  } catch (err) {
    return next(err);
  }
};

export const verifyingPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({ message: "Session not found or expired." });
    }

    const session = JSON.parse(sessionData);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

export const createPaystackPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId, callbackUrl } = req.body as {
      sessionId?: string;
      callbackUrl?: string;
    };

    if (!sessionId) {
      throw new ValidationError("Session id is required");
    }

    if (!callbackUrl) {
      throw new ValidationError("Callback url is required");
    }

    let parsedCallbackUrl: URL;
    try {
      parsedCallbackUrl = new URL(callbackUrl);
    } catch {
      throw new ValidationError("Callback url is invalid");
    }

    const sessionData = await redis.get(`payment-session:${sessionId}`);
    if (!sessionData) {
      throw new NotFoundError("Payment session not found or expired.");
    }

    const session = JSON.parse(sessionData);
    const user = req.user as Users;

    if (session.userId !== user.id) {
      throw new ForbiddenError(
        "You are not allowed to use this payment session.",
      );
    }

    const sellers = (session.sellers ?? []) as {
      paystackSubaccountCode: string | null;
      amount: number;
    }[];

    if (
      sellers.length === 0 ||
      sellers.some((seller) => !seller.paystackSubaccountCode)
    ) {
      throw new ValidationError(
        "One or more sellers in this order have not finished their payout setup yet. Please remove those items from your cart and try again.",
      );
    }

    const totalAmount = Number(session.totalAmount ?? 0);
    const discountAmount = Number(session.coupon?.discountAmount ?? 0) || 0;

    if (
      totalAmount <= 0 ||
      discountAmount < 0 ||
      discountAmount > totalAmount
    ) {
      throw new ValidationError("Order total is invalid.");
    }

    const amountInSubunits = Math.round((totalAmount - discountAmount) * 100);

    const PLATFORM_FEE_PERCENT = 10;

    const discountFactor = (totalAmount - discountAmount) / totalAmount;
    const sellerKeep = 1 - PLATFORM_FEE_PERCENT / 100;

    const { authorizationUrl } = await paystack.initialize({
      email: user.email,
      amountInSubunits,
      callbackUrl: `${parsedCallbackUrl.origin}${parsedCallbackUrl.pathname}?sessionId=${sessionId}`,
      metadata: {
        sessionId,
        userId: user.id,
      },
      split: {
        type: "flat",
        bearer_type: "account",
        subaccounts: sellers.map((seller) => ({
          subaccount: seller.paystackSubaccountCode as string,
          share: Math.floor(seller.amount * discountFactor * sellerKeep * 100),
        })),
      },
    });

    return res.status(201).json({
      success: true,
      authorizationUrl,
    });
  } catch (error) {
    return next(error);
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;

  const customerAccount = Math.round(amount * 100);
  const platformFee = Math.floor(customerAccount * 0.1);

  try {
    await stripe.accounts.update(sellerStripeAccountId, {
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAccount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: (req.user as Users).id,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.log({ err });
    next(err);
  }
};

export const paystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawBody = (req as any).rawBody as Buffer | undefined;
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!rawBody?.length || !signature || !secretKey) {
      return res.status(401).send("Unauthorized webhook request");
    }

    const computedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const isTrustworthy =
      computedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(computedSignature, "utf8"),
        Buffer.from(signature, "utf8"),
      );

    if (!isTrustworthy) {
      return res.status(401).send("Invalid webhook signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    if (event?.event === "charge.success") {
      const data = event.data ?? {};

      if (!data.metadata?.sessionId || !data.metadata?.userId) {
        console.warn(
          "Paystack charge.success without session metadata:",
          data.reference,
        );
        return res.status(200).json({ received: true, ignored: "no-metadata" });
      }

      const sessionId: string = data.metadata.sessionId;
      const sessionData = await redis.get(`payment-session:${sessionId}`);

      if (!sessionData) {
        console.warn(
          "Session expired or missing for paid charge:",
          sessionId,
          data.reference,
        );
        return res.status(200).json({ received: true });
      }

      const session = JSON.parse(sessionData);

      if (session.userId !== data.metadata.userId) {
        console.error(
          "Paystack charge owner mismatch for session:",
          sessionId,
          data.reference,
        );
        return res.status(200).json({ received: true });
      }

      const expectedSubunits = Math.round(
        (Number(session.totalAmount ?? 0) -
          (Number(session.coupon?.discountAmount ?? 0) || 0)) *
          100,
      );

      if (expectedSubunits > 0 && Number(data.amount) !== expectedSubunits) {
        console.error(
          "Paystack charge amount mismatch — manual review:",
          sessionId,
          data.reference,
          {
            expectedSubunits,
            charged: data.amount,
            currency: data.currency,
          },
        );
        return res
          .status(200)
          .json({ received: true, note: "amount-mismatch" });
      }

      const outcome = await createOrdersForSession(
        sessionId,
        data.metadata.userId,
      );

      return res.status(200).json({ received: true, outcome });
    }

    if (event?.event === "refund.created") {
      console.log(
        `Paystack webhook processing refund: ${event.data.reference}`,
      );
      return res
        .status(200)
        .json({ received: true, outcome: "refund-received" });
    }

    console.log(`Paystack webhook ignored: ${event?.event}`);
    return res.status(200).json({ received: true, ignored: event?.event });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return next(error);
  }
};

const createOrdersForSession = async (
  sessionId: string,
  userId: string,
): Promise<"created" | "already-processed" | "session-missing"> => {
  const sessionKey = `payment-session:${sessionId}`;
  const sessionData = await redis.get(sessionKey);

  if (!sessionData) {
    console.warn("Session data expired or missing for", sessionId);
    return "session-missing";
  }

  const { cart, totalAmount, shippingAddressId, coupon } =
    JSON.parse(sessionData);

  const user = await prisma.users.findUnique({ where: { id: userId } });
  const name = user?.name;
  const email = user?.email as string;

  const shopGrouped = cart.reduce((acc: any, item: any) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  let createdNewOrder = false;

  for (const shopId in shopGrouped) {
    const existing = await prisma.orders.findFirst({
      where: { sessionId, shopId },
      select: { id: true },
    });

    if (existing) continue;

    const orderItems = shopGrouped[shopId];

    let orderTotal = orderItems.reduce(
      (sum: number, p: any) => sum + p.quantity * p.sale_price,
      0,
    );

    // Apply discount if applicable
    if (
      coupon &&
      coupon.discountedProductId &&
      orderItems.some((item: any) => item.id === coupon.discountedProductId)
    ) {
      const discountedItem = orderItems.find(
        (item: any) => item.id === coupon.discountedProductId,
      );

      if (discountedItem) {
        const discount =
          coupon.discountPercentage > 0
            ? (discountedItem.sale_price *
                discountedItem.quantity *
                coupon.discountPercentage) /
              100
            : coupon.discountAmount;

        orderTotal -= discount;
      }
    }

    let order;
    try {
      order = await prisma.orders.create({
        data: {
          sessionId,
          userId,
          shopId,
          total: orderTotal,
          status: "Paid",
          shippingAddressId: shippingAddressId || null,
          couponCode: coupon?.code || null,
          discountAmount: coupon?.discountAmount || 0,
          oderItems: {
            create: orderItems.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.sale_price,
              selectedOptions: item.selectedOptions,
            })),
          },
        },
      });
      createdNewOrder = true;
    } catch (err: any) {
      if (err?.code === "P2002") {
        continue;
      }
      throw err;
    }

    // Update product & analytics
    for (const item of orderItems) {
      const { id: productId, quantity } = item;

      await prisma.products.update({
        where: { id: productId },
        data: {
          stock: { decrement: quantity },
          totalSales: { increment: quantity },
        },
      });

      await prisma.productAnalytics.upsert({
        where: { productId },
        create: {
          productId,
          shopId,
          purchases: quantity,
          lastViewedAt: new Date(),
        },
        update: {
          purchases: { increment: quantity },
        },
      });

      const existingAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId },
      });

      const newAction = {
        productId,
        shopId,
        action: "purchase",
        timestamp: Date.now(),
      };

      const currentActions = Array.isArray(existingAnalytics?.actions)
        ? (existingAnalytics.actions as Prisma.JsonArray)
        : [];

      if (existingAnalytics) {
        await prisma.userAnalytics.update({
          where: { userId },
          data: {
            lastVisited: new Date(),
            actions: [...currentActions, newAction],
          },
        });
      } else {
        await prisma.userAnalytics.create({
          data: {
            userId,
            lastVisited: new Date(),
            actions: [newAction],
          },
        });
      }
    }

    // Send email for user
    await orderConfirmationQueue.add(
      "order-confirmation",
      {
        orderId: order.id,
        userEmail: email,
        userName: name as string,
        cart,
        totalAmount: coupon?.discountAmount
          ? totalAmount - coupon?.discountAmount
          : totalAmount,
        trackingUrl: `https://eshop.com/order/${order.id}`,
      },
      {
        jobId: `order-confirmation-${order.id}`,
      },
    );

    // Create notifications for sellers
    const createdShopIds = Object.keys(shopGrouped);
    const sellerShops = await prisma.shops.findMany({
      where: { id: { in: createdShopIds } },
      select: {
        id: true,
        sellerId: true,
        name: true,
      },
    });

    for (const shop of sellerShops) {
      const firstProduct = shopGrouped[shop.id][0];
      const productTitle = firstProduct?.title || "new item";

      await prisma.notifications.create({
        data: {
          title: "🛒 New Order Received",
          message: `A customer just ordered ${productTitle} from your shop.`,
          creatorId: userId,
          receiverId: shop.sellerId as string,
          redirectLink: `/order/${order.id}`,
        },
      });

      // user notification
      await prisma.notifications.create({
        data: {
          title: "🎉 Order Confirmed",
          message: `Your order has been confirmed successfully! We're now preparing your order #${order.id}.`,
          creatorId: shop.sellerId as string,
          receiverId: userId,
          redirectLink: `/order/${order.id}`,
        },
      });

      // admin notification
      await prisma.notifications.create({
        data: {
          title: "📦 Platform Order Alert",
          message: `${productTitle} was just ordered by a customer from ${shop.name}'s shop.`,
          creatorId: userId,
          receiverId: "admin",
          redirectLink: `/order/${order.id}`,
        },
      });
    }
  }

  await redis.del(sessionKey);

  return createdNewOrder ? "created" : "already-processed";
};

// create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];
    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rawBody = (req as any).rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        String(process.env.STRIPE_WEBHOOK_SECRET),
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const outcome = await createOrdersForSession(sessionId, userId);

      res.status(200).json({ received: true, outcome });
    } else {
      return res.status(200).json({ received: true, ignored: event.type });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const getSellerOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller?.id },
    });

    const orders = await prisma.orders.findMany({
      where: { shopId: shop?.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getSellerRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller?.id },
      select: { id: true },
    });

    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const orders = await prisma.orders.findMany({
      where: {
        shopId: shop.id,
        createdAt: { gte: start },
      },
      select: { total: true, createdAt: true },
    });

    const monthly = new Map<string, number>();

    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
      monthly.set(key, (monthly.get(key) ?? 0) + order.total);
    }

    const revenueData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const amount = monthly.get(key) ?? 0;

      return {
        month: MONTH_NAMES[date.getMonth()],
        amount: Math.round(amount * 100) / 100,
      };
    });

    return res.status(200).json({ success: true, revenueData });
  } catch (err) {
    return next(err);
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = req.params.id;

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { oderItems: true },
    });

    if (!order) {
      throw new NotFoundError("Order with this id does not exists");
    }

    const shippingAddress = order.shippingAddressId
      ? await prisma.address.findUnique({
          where: { id: order.shippingAddressId },
        })
      : null;

    const coupon = order.couponCode
      ? await prisma.discount_codes.findUnique({
          where: { discountCode: order.couponCode },
        })
      : null;
    const productId = order.oderItems.map((item) => item.productId);

    const products = await prisma.products.findMany({
      where: { id: { in: productId } },
      select: { id: true, title: true, images: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = order.oderItems.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus) {
      return res
        .status(400)
        .json({ error: "Missing order ID or delivery status." });
    }

    const allowedStatuses = [
      "Ordered",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError("Invalid delivery status."));
    }

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return next(new NotFoundError("Order not found!"));
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        deliveryStatus,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyCouponCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponCode, cart } = req.body;

    if (!couponCode || !cart || cart.length === 0) {
      throw new ValidationError("Coupon code and cart are required!");
    }

    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: couponCode },
    });

    if (!discount) {
      return next(new ValidationError("Coupon code isn't valid!"));
    }

    const matchingProduct = cart.find((item: any) =>
      item.discount_codes?.some((d: any) => d === discount.id),
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmount: 0,
        message: "No matching product found in cart for this coupon",
      });
    }

    let discountAmount = 0;
    const price = matchingProduct.sale_price * matchingProduct.quantity;

    if (discount.discountType === "percentage") {
      discountAmount = (price * discount.discountValue) / 100;
    } else if (discount.discountType === "flat") {
      discountAmount = discount.discountValue;
    }

    // Prevent discount from being greater than total price
    discountAmount = Math.min(discountAmount, price);

    res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountedProductId: matchingProduct.id,
      discountType: discount.discountType,
      message: "Discount applied to 1 eligible product",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sendLog({
      type: "success",
      message: `User orders retrieved successfully ${req?.user?.email}`,
      source: "order-service",
    });

    const orders = await prisma.orders.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        oderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllOrdersForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        user: true,
        shop: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const orders = await prisma.orders.findMany({
      where: { createdAt: { gte: start } },
      select: { total: true, createdAt: true },
    });

    const monthly = new Map<string, number>();

    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
      monthly.set(key, (monthly.get(key) ?? 0) + order.total);
    }

    const revenueData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const amount = monthly.get(key) ?? 0;

      return {
        month: MONTH_NAMES[date.getMonth()],
        amount: Math.round(amount * 100) / 100,
      };
    });

    return res.status(200).json({ success: true, revenueData });
  } catch (error) {
    return next(error);
  }
};
