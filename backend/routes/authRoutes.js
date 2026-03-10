const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const verifyToken = require("../middleware/authMiddleware");

dotenv.config(); // Load environment variables

const router = express.Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ishwaryarajendran77@gmail.com";

console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging to check JWT secret

// Signup Route
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required ❌" });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userType = email === ADMIN_EMAIL ? "admin" : "user";

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, user_type) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, userType]
    );

    const token = jwt.sign({ id: newUser.rows[0].id, role: userType }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Generated Token (Signup):", token); // Debugging token

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({
      message: "User registered successfully ✅",
      role: userType,
      token, // Send token to frontend
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal Server Error ❌", error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email not found ❌" });
    }

    console.log("User Data:", user.rows[0]); // Debugging to check user data

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect password ❌" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].user_type }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Generated Token (Login):", token); // Debugging token

    // Store token in httpOnly cookie for security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });

    res.json({ 
      message: "Login successful ✅", 
      role: user.rows[0].user_type,
      token // Send token to frontend
    });
  } catch (err) {
    next(err);
  }
});
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query(
      "SELECT id, name, email, user_type FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const learntBooksResult = await pool.query(
      "SELECT id, title, author FROM books WHERE id = $1",
      [userId]
    );

    res.status(200).json({
      user: userResult.rows[0], // Send user details
      learntBooks: learntBooksResult.rows, // Send learnt books
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Internal Server Error ❌" });
  }
});

// Fetch all users (Admin only)
router.get("/users", verifyToken, async (req, res) => {
  try {
    console.log("Decoded user:", req.user); // Log the decoded user to check the role

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    const result = await pool.query("SELECT id, name, email, user_type FROM users");
    res.json({ message: "Users fetched ✅", users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error ❌" });
  }
});

// Logout Route 
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful ✅" });
});

module.exports = router; 
