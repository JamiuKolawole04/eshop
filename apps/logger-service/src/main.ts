import express from "express";
import WebSocket from "ws";
import http from "node:http";

import { consumeKafkaMessages } from "./logger-consumer";

const app = express();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6008;

const wsServer = new WebSocket.Server({ noServer: true });

export const clients = new Set<WebSocket>();

app.get("/health", (req, res) => {
  res.send({ message: "Welcome to logger-service!" });
});

wsServer.on("connection", (ws) => {
  console.log(`New logger client connected`);
  clients.add(ws);

  ws.on("close", () => {
    console.log(`Logger client diconnected`);
    clients.delete(ws);
  });
});

const server = http.createServer(app);

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request);
  });
});

server.listen(port, () => {
  console.log(`Logger service is running at http://${host}:${port}`);
});

consumeKafkaMessages();
