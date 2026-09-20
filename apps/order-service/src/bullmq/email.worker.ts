import { Worker } from "bullmq";

import { bullmqRedis } from "@packages/redis";
import { processOrderConfirmationEmail } from "./email.queue";

export const emailWorker = new Worker(
  "order-confirmation-queue",
  async (job) => {
    return await processOrderConfirmationEmail(job);
  },
  {
    connection: bullmqRedis,
    concurrency: 1,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job failed: ${job?.id}`, error);
});

console.log("📨 Order confirmation email worker started");
