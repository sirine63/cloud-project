require("dotenv").config({ override: true });
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const app = express();
const cors = require("cors");
app.use(cors());

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
process.on("uncaughtException", (err) => {
  console.log("🔥 UNCAUGHT ERROR:");
  console.dir(err, { depth: null });
});
// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("RAW ENV:");
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

// Replace your previous app.use("/download", ...) with this:
app.use("/download", express.static(path.join(__dirname, "./")));
app.use(express.json());

/* =======================
   REDIS CLIENT
======================= */
const redisClient = createClient({
  url: "redis://localhost:6379",
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
console.log("UPLOAD ROUTE LOADED");
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("FILE:", req.file);

    const jobId = Date.now().toString();

    const fileUrl = req.file.path || req.file.secure_url || req.file.filename;

    await redisClient.set(
      `job:${jobId}`,
      JSON.stringify({
        status: "processing",
        progress: 0,
        file: fileUrl,
      }),
    );

    await redisClient.lPush("tasks", JSON.stringify({ jobId, file: fileUrl }));

    return res.json({ jobId });
  } catch (err) {
    console.error("UPLOAD CRASH:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
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
/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("🔥 MIDDLEWARE ERROR:", err);
  res.status(500).json({
    error: "Middleware error",
    details: err.message || err,
  });
});
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
