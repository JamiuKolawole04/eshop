"use server";

import { kafka } from "@packages/kafka";

type EventData = {
  shopId: string;
  productId: string;
  userId: string;
  action: string;
  country?: string;
  city?: string;
  device?: string;
};

const producer = kafka.producer();

export async function sendKafkaEvents(eventData: EventData) {
  try {
    await producer.connect();
    await producer.send({
      topic: "users-events",
      messages: [
        {
          value: JSON.stringify(eventData),
        },
      ],
    });
  } catch (err) {
    console.error(err);
  } finally {
    await producer.disconnect();
  }
}
