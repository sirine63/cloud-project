const { createClient } = require("redis");

console.log("Worker started 👷");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// 🔥 IMPORTANT: catch Redis errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

async function processTasks() {
  while (true) {
    try {
      const task = await redisClient.rPop("tasks");

      if (task) {
        console.log("Processing task:", JSON.parse(task));
      } else {
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (err) {
      console.error("Worker loop error:", err);
      await new Promise((r) => setTimeout(r, 3000)); // prevent crash loop
    }
  }
}

async function startWorker() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis ✅");

    processTasks();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);

    // 🔥 retry instead of crashing
    setTimeout(startWorker, 5000);
  }
}

startWorker();
