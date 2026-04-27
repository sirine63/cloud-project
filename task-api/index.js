const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");

const app = express();
const cors = require("cors");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  }),
);
/* =======================
   REDIS CLIENT
======================= */
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

async function connectRedis() {
  await redisClient.connect();
  console.log("Redis connected ✅");
}

connectRedis();

/* =======================
   MULTER SETUP
======================= */

// storage engine (cloud)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });
/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("Task API running 🚀");
});

/* =======================
   UPLOAD + CREATE JOB
======================= */
app.post("/upload", upload.single("image"), async (req, res) => {
  const jobId = uuidv4();

  // 🔥 IMPORTANT: Cloudinary gives URL
  const fileUrl = req.file.path;

  await redisClient.set(
    `job:${jobId}`,
    JSON.stringify({
      status: "processing",
      progress: 0,
      file: fileUrl,
    }),
  );

  await redisClient.lPush(
    "tasks",
    JSON.stringify({
      jobId,
      file: fileUrl,
    }),
  );

  res.json({ jobId });
});

/* =======================
   GET JOB STATUS
======================= */
app.get("/status/:jobId", async (req, res) => {
  const data = await redisClient.get(`job:${req.params.jobId}`);

  if (!data) {
    return res.json({ status: "not found" });
  }

  res.json(JSON.parse(data));
});

/* =======================
   SERVER START
======================= */
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
