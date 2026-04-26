const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const fs = require("fs");

const app = express();

/* 
========================
1. CREATE STORAGE ENGINE
========================
This tells multer:
- where to save files
- how to name them
*/
const storage = multer.diskStorage({
  // 📁 WHERE to save files
  destination: (req, file, cb) => {
    // "uploads/" = folder name
    cb(null, "uploads/");
  },

  // 🏷 HOW to name files
  filename: (req, file, cb) => {
    // Date.now() prevents duplicate names
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/*
========================
2. CREATE MULTER UPLOADER
========================
This is the middleware that handles file uploads
*/
const upload = multer({ storage });

/*
========================
3. CREATE "uploads" FOLDER IF NOT EXISTS
========================
Node does NOT automatically create folders
So we manually create it
*/
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/*
========================
4. UPLOAD ROUTE
========================
POST /upload → receives file
*/
app.post("/upload", upload.single("image"), async (req, res) => {
  // 📌 file info after upload
  console.log("File received:", req.file);

  /*
  ========================
  5. SEND TASK TO REDIS
  ========================
  We push file name into Redis queue
  so worker can process it later
  */
  await redisClient.lPush(
    "tasks",
    JSON.stringify({
      file: req.file.filename,
    }),
  );

  /*
  ========================
  6. RESPONSE TO USER
  ========================
  */
  res.json({
    message: "File uploaded successfully",
    file: req.file.filename,
  });
});
