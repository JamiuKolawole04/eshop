import { Consumer, EachMessagePayload } from "kafkajs";

import { kafka } from "@packages/kafka";
import { prisma } from "@packages/prisma";
import { incrementUnseenCount } from "@packages/redis";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat.new_message";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;

const buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  console.log(`Kafka consumer connected and subscribed to topic ${TOPIC}`);

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      try {
        const parsed: BufferedMessage = JSON.parse(message.value.toString());
        buffer.push(parsed);

        // if this is the fisrt message in an empty array, then start the timer
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (err) {
        console.log(`Failed to parse kafka message`, err);
      }
    },
  });
}

// flush buffer to db and reset timer
async function flushBufferToDb() {
  const toInsert = buffer.splice(0, buffer.length);

  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (toInsert.length === 0) return;

  try {
    const prismaPayload = toInsert.map((msg) => ({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderType,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));

    await prisma.message.createMany({
      data: prismaPayload,
    });

    for (const msg of prismaPayload) {
      const receiverType = msg.senderType === "user" ? "seller" : "user";
      await incrementUnseenCount(receiverType, msg.conversationId);
    }

    console.log(`Flushed ${prismaPayload.length} messages to DB and Redis.`);
  } catch (err) {
    console.log(`Error inserting messages to DB:`, err);

    buffer.unshift(...toInsert);

    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
    }
  }
}
