import cron from "node-cron";

import { prisma } from "@packages/prisma";

cron.schedule("* * * * *", () => {
  console.log("Running a task every minute");
});

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    // Delete products where `deletedAt` is older than 24 hours
    await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });
  } catch (error) {
    console.log(error);
  }
});
