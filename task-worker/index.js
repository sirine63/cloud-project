const { createClient } = require("redis");

console.log("Worker starting 👷");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// --------------------
// Redis error handling
// --------------------
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// --------------------
// Main worker loop
// --------------------
async function startWorker() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis ✅");

    while (true) {
      try {
        // BLOCKING pop (waits until task exists)
        const task = await redisClient.brPop("tasks", 0);

        const data = JSON.parse(task.element);

        console.log("📦 Processing file:", data.file);

        // simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 3000));

        console.log("✅ Done processing:", data.file);

        await redisClient.set(
          `job:${data.jobId}`,
          JSON.stringify({
            status: "done",
            file: data.file,
          }),
        );
      } catch (err) {
        console.error("❌ Task processing error:", err);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  } catch (err) {
    console.error("❌ Redis connection failed:", err);

    // retry connection
    setTimeout(startWorker, 5000);
  }
}

// start worker
startWorker();
