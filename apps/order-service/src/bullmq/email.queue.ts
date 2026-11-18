import { Job, JobsOptions, Queue } from "bullmq";

import { OrderConfirmationJob, SellerOrderAlertJob } from "./job-types";
import { sendMail } from "../utils/sendMail";
import { bullmqRedis } from "@packages/redis";

export const ORDER_CONFIRMATION_QUEUE = "order-confirmation-queue";
export const SELLER_ORDER_ALERT_JOB = "seller-order-alert";

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: 100,
  removeOnFail: 1000,
};

export const orderConfirmationQueue = new Queue<OrderConfirmationJob>(
  ORDER_CONFIRMATION_QUEUE,
  {
    connection: bullmqRedis,
    defaultJobOptions: { ...defaultJobOptions },
  },
);

export const sellerOrderAlertQueue = new Queue<SellerOrderAlertJob>(
  ORDER_CONFIRMATION_QUEUE,
  {
    connection: bullmqRedis,
    defaultJobOptions: { ...defaultJobOptions },
  },
);

export const processOrderConfirmationEmail = async (
  job: Job<OrderConfirmationJob>,
): Promise<void> => {
  const {
    orderId,
    userEmail,
    userName,
    cart,
    totalAmount,
    trackingUrl,
    paymentMethod,
    contactPhone,
  } = job.data;

  // Send order confirmation  email
  await sendMail(
    userEmail,
    "🛍 Your Eshop Order Confirmation",
    "order-confirmation",
    {
      name: userName,
      cart,
      totalAmount,
      trackingUrl,
      paymentMethod: paymentMethod ?? "online",
      contactPhone: contactPhone ?? null,
    },
  );

  console.log(`Order confirmation email sent for order ${orderId}`);
};

export const processSellerOrderAlertEmail = async (
  job: Job<SellerOrderAlertJob>,
): Promise<void> => {
  const {
    orderId,
    sellerEmail,
    sellerName,
    shopName,
    buyerName,
    cart,
    totalAmount,
    paymentMethod,
    contactPhone,
    orderUrl,
  } = job.data;

  const sent = await sendMail(
    sellerEmail,
    `🛒 New order for ${shopName}`,
    "seller-order-alert",
    {
      sellerName,
      shopName,
      buyerName,
      cart,
      totalAmount,
      paymentMethod: paymentMethod ?? "online",
      contactPhone: contactPhone ?? null,
      orderId,
      orderUrl,
    },
  );

  if (!sent) {
    throw new Error(`Seller order alert email failed for order ${orderId}`);
  }

  console.log(`Seller order alert email sent for order ${orderId}`);
};
