import { kafka } from "@packages/kafka";
import {
  updateProductAnalytics,
  updateShopAnalytics,
  updateUserAnalytics,
} from "./services/analytics.service";
import { EventData } from "./types";

const consumer = kafka.consumer({ groupId: "user-events-group" });

const eventQueue: EventData[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) {
    return;
  }

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === "shop_visit") {
      await updateShopAnalytics(event);

      continue;
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_wishlist",
      "remove_from_cart",
    ];

    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    if (event.userId) {
      await updateUserAnalytics(event);
    }
    await updateProductAnalytics(event);
  }
};

setInterval(processQueue, 3000);

export const consumeKfkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "users-events", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumeKfkaMessages().catch((err) => console.error(err));
