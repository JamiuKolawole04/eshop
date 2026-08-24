import fs from "node:fs";
import path from "node:path";
import { Kafka } from "kafkajs";

const KAFKA_BROKER_URI = String(process.env.KAFKA_BROKER_URI);

export const kafka = new Kafka({
  clientId: "eshop-kafka-service",
  brokers: [KAFKA_BROKER_URI],
  ssl: {
    rejectUnauthorized: true,
    ca: [
      fs.readFileSync(path.resolve(String(process.env.KAFKA_CA_PATH)), "utf-8"),
    ],
  },
  sasl: {
    mechanism: "scram-sha-256",
    username: String(process.env.KAFKA_USER_NAME),
    password: String(process.env.KAFKA_PASSWORD),
  },
});
