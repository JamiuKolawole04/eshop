import { Queue } from "bullmq";
import { OrderConfirmationJob } from "./job-types";
import { sendMail } from "../utils/sendMail";

export const ORDER_CONFIRMATION_QUEUE = "order-confirmation-queue";

export const orderConfirmationQueue = new Queue<OrderConfirmationJob>(
  ORDER_CONFIRMATION_QUEUE,
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    },
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
  job: OrderConfirmationJob,
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
