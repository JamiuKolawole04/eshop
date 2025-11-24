import cors from "cors";
import express from "express";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

const server = app.listen(port, host, () => {
  console.log(`Auth service is running at http://${host}:${port}`);
});

server.on("error", console.error);
