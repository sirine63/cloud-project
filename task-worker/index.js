const express = require("express");
const app = express();

app.use(express.json());

console.log("Worker started 👷");
const { createClient } = require("redis"); //load a module (library) into my code

const redisClient = createClient({
  url: "redis://redis:6379",
}); //Connect to Redis service inside Kubernetes cluster on port 6379

// main function
async function startWorker() {
  await redisClient.connect(); // ✅ wait for connection
  console.log("Connected to Redis ✅");

  processTasks(); // start loop AFTER connection
}
async function processTasks() {
  while (true) {
    const task = await redisClient.rPop("tasks"); //It is constantly checking Redis

    if (task) {
      console.log("Processing task:", JSON.parse(task));
    } else {
      console.log("No tasks in queue...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
startWorker();
