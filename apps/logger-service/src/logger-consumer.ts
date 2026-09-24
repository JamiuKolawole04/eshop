import { kafka } from "@packages/kafka";
import { clients } from "./main";

const TOPIC = "logs";

const consumer = kafka.consumer({ groupId: "log-events-group" });
const logQueue: string[] = [];

const processLogs = () => {
  if (logQueue.length == 0) return;

  console.log(`processing ${logQueue.length} logs in batch`);
  const logs = [...logQueue];
  logQueue.length = 0;

  clients.forEach((client) => {
    logs.forEach((log) => {
      client.send(log);
    });
  });
};

setInterval(processLogs, 3000);

// consume log mesesage from kafka
export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  console.log(`Kafka consumer connected and subscribed to topic ${TOPIC}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const log = JSON.parse(message.value.toString());
      logQueue.push(JSON.stringify(log));
    },
  });
};

consumeKafkaMessages().catch((err) => console.error(err));
