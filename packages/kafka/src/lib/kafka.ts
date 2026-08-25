import { Kafka } from "kafkajs";

// "console.log(require('fs').readFileSync('ca.pem').toString('base64'))"

const KAFKA_BROKER_URI = String(process.env.KAFKA_BROKER_URI);
const caCert = Buffer.from(
  String(process.env.KAFKA_CA_CERT),
  "base64",
).toString("utf-8");

export const kafka = new Kafka({
  clientId: "eshop-kafka-service",
  brokers: [KAFKA_BROKER_URI],
  ssl: {
    rejectUnauthorized: true,
    ca: [caCert],
  },
  sasl: {
    mechanism: "scram-sha-256",
    username: String(process.env.KAFKA_USER_NAME),
    password: String(process.env.KAFKA_PASSWORD),
  },
});
