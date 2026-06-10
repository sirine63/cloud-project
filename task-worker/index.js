const { createClient } = require("redis");
const sharp = require("sharp"); // 1. Added Sharp for image processing
const path = require("path");
console.log("Worker starting 👷");

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Mock updateProgress function (since it wasn't defined in your original snippet)
async function updateProgress(jobId, progress) {
  console.log(`Job ${jobId} progress: ${progress}%`);
}

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
        await updateProgress(data.jobId, 10);

        /* ==========================================
           NEW RESIZING CODE GOES HERE
        ========================================== */
        console.log("📥 Downloading image from Cloudinary...");
        const response = await fetch(data.file);
        const arrayBuffer = await response.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        await updateProgress(data.jobId, 50);
        console.log("✂️ Resizing image to 300px width...");

        // This resizes the image to 300px wide and automatically calculates the height
        //  Update to this:
        const path = require("path");

        // Point this exactly to your API project folder where index.js lives
        const apiFolder = "C:\\Users\\bagga\\Cloud Project\\task-api";
        const outputFilename = `resized-${data.jobId}.png`;

        // This joins the path to save it right inside the API folder
        const absoluteOutputPath = path.join(apiFolder, outputFilename);

        await sharp(inputBuffer)
          .resize({ width: 300 })
          .toFile(absoluteOutputPath); // 🚀 Saves it directly into your API folder!
        await updateProgress(data.jobId, 90);
        /* ==========================================
           END OF RESIZING CODE
        ========================================== */

        console.log("✅ Done processing. Saved as:", outputFilename);

        await redisClient.set(
          `job:${data.jobId}`,
          JSON.stringify({
            status: "done",
            progress: 100,
            file: outputFilename, // Updates status with the new local filename
          }),
        );
      } catch (err) {
        console.error("❌ Task processing error:", err);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    setTimeout(startWorker, 5000);
  }
}

// start worker
startWorker();
