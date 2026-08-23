import { Kafka } from "kafkajs";

const KAFKA_BROKER_URI = String(process.env.KAFKA_BROKER_URI);

export const kafka = new Kafka({
  clientId: "eshop-kafka-service",
  brokers: [KAFKA_BROKER_URI],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: String(process.env.KAFKA_USER_NAME),
    password: String(process.env.KAFKA_PASSWORD),
  },
});
