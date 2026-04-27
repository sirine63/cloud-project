const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");

const app = express();
const cors = require("cors");
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
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

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
  try {
    const jobId = uuidv4();

    const job = {
      status: "processing",
      file: req.file.filename,
    };

    // 🔥 STORE IN REDIS
    await redisClient.set(`job:${jobId}`, JSON.stringify(job));

    // push to worker queue
    await redisClient.lPush(
      "tasks",
      JSON.stringify({ jobId, file: req.file.filename }),
    );

    res.json({
      jobId,
      status: "processing",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
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
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
