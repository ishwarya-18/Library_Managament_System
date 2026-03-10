const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const pool = require("./db");

const app = express();

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ JSON & Cookie Parser
app.use(express.json());
app.use(cookieParser());

// ✅ Rate Limiting (Apply before routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increase the limit to 500 requests per window
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Import adminRoutes

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/books/admin", adminRoutes); // Mount adminRoutes under /api/books/admin

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("E-Library Backend is Running 🚀");
});

// ✅ Database Connection Test
app.get("/test-db", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW();");
    res.json({ message: "Database connected ✅", time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Server error ❌" : err.message,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});