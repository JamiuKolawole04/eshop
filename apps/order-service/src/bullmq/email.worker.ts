import { Worker } from "bullmq";
import { processOrderConfirmationEmail } from "./email.queue";

export const emailWorker = new Worker(
  "order-confirmation-queue",
  async (job) => {
    return await processOrderConfirmationEmail(job);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    },
    concurrency: 1,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job failed: ${job?.id}`, error);
});

// Start the worker process
console.log("📨 Order confirmation email worker started");
