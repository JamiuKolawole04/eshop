"use server";

import { headers } from "next/headers";

import { kafka } from "@packages/kafka";

type EventData = {
  shopId?: string;
  productId?: string;
  userId?: string;
  action: string;
  country?: string;
  city?: string;
  device?: string;
  page?: string;
  visitorId?: string;
};

type Producer = ReturnType<typeof kafka.producer>;

const globalForKafka = globalThis as unknown as {
  __eshopKafkaProducer?: Producer;
  __eshopKafkaConnecting?: Promise<Producer>;
};

const BOT_UA =
  /bot|crawler|crawl|spider|slurp|bingpreview|facebookexternalhit|linkedinbot|twitterbot|telegrambot|headless|lighthouse|pagespeed|python-requests|curl|wget|go-http-client|node-fetch/i;

const getProducer = async (): Promise<Producer> => {
  if (globalForKafka.__eshopKafkaProducer) {
    return globalForKafka.__eshopKafkaProducer;
  }

  if (!globalForKafka.__eshopKafkaConnecting) {
    const producer = kafka.producer();

    globalForKafka.__eshopKafkaConnecting = producer
      .connect()
      .then(() => {
        globalForKafka.__eshopKafkaProducer = producer;
        return producer;
      })
      .catch((err) => {
        globalForKafka.__eshopKafkaProducer = undefined;
        globalForKafka.__eshopKafkaConnecting = undefined;
        throw err;
      });
  }

  return globalForKafka.__eshopKafkaConnecting;
};

const resetProducer = async () => {
  const producer = globalForKafka.__eshopKafkaProducer;

  globalForKafka.__eshopKafkaProducer = undefined;
  globalForKafka.__eshopKafkaConnecting = undefined;

  if (producer) {
    try {
      await producer.disconnect();
    } catch {
      // Best-effort disconnect only.
    }
  }
};

export async function sendKafkaEvents(eventData: EventData) {
  const userAgent = (await headers()).get("user-agent") ?? "";
  if (BOT_UA.test(userAgent)) return;

  try {
    const producer = await getProducer();

    await producer.send({
      topic: "users-events",
      messages: [
        {
          value: JSON.stringify(eventData),
        },
      ],
    });
  } catch (err) {
    console.error(
      `[kafka] users-events send failed (${eventData.action})`,
      err,
    );
    await resetProducer();
  }
}
