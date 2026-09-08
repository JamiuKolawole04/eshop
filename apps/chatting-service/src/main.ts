import express from "express";
import cookieParser from "cookie-parser";

const app = express();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6006;

app.disable("x-powered-by");

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send({ message: "Welcome to chatting-service!" });
});

const server = app.listen(port, () => {
  console.log(`Chatting service is running at http://${host}:${port}`);
});
server.on("error", console.error);
