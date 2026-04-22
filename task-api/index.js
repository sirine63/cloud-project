const express = require("express");
const app = express();

app.use(express.json());

const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();
// health check
app.get("/", (req, res) => {
  res.send("Task API is running 🚀");
});

// receive task
app.post("/task", (req, res) => {
  const task = req.body.task;

  console.log("Received task:", task);

  res.json({
    message: "Task received",
    task: task,
    status: "processing",
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.post("/create-task", async (req, res) => {
  const task = JSON.stringify(req.body);

  await redisClient.lPush("tasks", task);

  console.log("Task added to Redis:", task);

  res.send("Task queued");
});
