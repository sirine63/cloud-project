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

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.post("/create-task", upload.single("file"), async (req, res) => {
  const task = {
    filename: req.file.filename,
  };

  await redisClient.lPush("tasks", JSON.stringify(task));
  res.send("Task queued");
});
