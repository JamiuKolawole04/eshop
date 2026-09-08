import express from "express";

const app = express();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6007;

app.get("/health", (req, res) => {
  res.send({ message: "Welcome to recommendation-service!" });
});

const server = app.listen(port, () => {
  console.log(`Recommendation service is running at http://${host}:${port}`);
});
server.on("error", console.error);
