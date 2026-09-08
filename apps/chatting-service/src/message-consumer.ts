import { Consumer, EachMessagePayload } from "kafkajs";

import { kafka } from "@packages/kafka";
import { prisma } from "@packages/prisma";

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

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
}
