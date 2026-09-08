import express from "express";

const app = express();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6008;

app.get("/health", (req, res) => {
  res.send({ message: "Welcome to logger-service!" });
});

const server = app.listen(port, () => {
  console.log(`Logger service is running at http://${host}:${port}`);
});
server.on("error", console.error);
