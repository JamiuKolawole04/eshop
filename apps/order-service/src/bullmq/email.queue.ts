import { Job, Queue } from "bullmq";

import { OrderConfirmationJob } from "./job-types";
import { sendMail } from "../utils/sendMail";
import { bullmqRedis } from "@packages/redis";

export const ORDER_CONFIRMATION_QUEUE = "order-confirmation-queue";

export const orderConfirmationQueue = new Queue<OrderConfirmationJob>(
  ORDER_CONFIRMATION_QUEUE,
  {
    connection: bullmqRedis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },
  },
);

export const processOrderConfirmationEmail = async (
  job: Job<OrderConfirmationJob>,
): Promise<void> => {
  const { orderId, userEmail, userName, cart, totalAmount, trackingUrl } =
    job.data;

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
    },
  );

  console.log(`Order confirmation email sent for order ${orderId}`);
};
