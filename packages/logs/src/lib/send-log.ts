import { kafka } from "@packages/kafka";

let producer: ReturnType<typeof kafka.producer> | null = null;
let connecting: Promise<void> | null = null;

const getProducer = async () => {
  producer ??= kafka.producer();
  connecting ??= producer.connect();
  await connecting;
  return producer;
};

export async function sendLog({
  type = "info",
  message,
  source = "unknown-service",
}: {
  type?: "info" | "error" | "warning" | "success" | "debug";
  message: string;
  source?: string;
}) {
  const logPayload = {
    type,
    message,
    timestamp: new Date().toISOString(),
    source,
  };

  try {
    const client = await getProducer();
    await client.send({
      topic: "logs",
      messages: [{ value: JSON.stringify(logPayload) }],
    });
  } catch (err) {
    producer = null;
    connecting = null;
    console.error(
      `[sendLog:${type}] ${source} — ${message}`,
      err instanceof Error ? err.message : err,
    );
  }
}
