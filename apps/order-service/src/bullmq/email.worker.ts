import { Job, Worker } from "bullmq";

import { bullmqRedis } from "@packages/redis";
import {
  ORDER_CONFIRMATION_QUEUE,
  SELLER_ORDER_ALERT_JOB,
  processOrderConfirmationEmail,
  processSellerOrderAlertEmail,
} from "./email.queue";
import { OrderConfirmationJob, SellerOrderAlertJob } from "./job-types";

export const emailWorker = new Worker(
  ORDER_CONFIRMATION_QUEUE,
  async (job) => {
    if (job.name === SELLER_ORDER_ALERT_JOB) {
      return await processSellerOrderAlertEmail(
        job as unknown as Job<SellerOrderAlertJob>,
      );
    }

    return await processOrderConfirmationEmail(
      job as unknown as Job<OrderConfirmationJob>,
    );
  },
  {
    connection: bullmqRedis,
    concurrency: 1,
    drainDelay: 30,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job failed: ${job?.id}`, error);
});

console.log("📨 Order confirmation email worker started");
