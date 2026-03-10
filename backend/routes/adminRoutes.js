const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Admin Activity Route
router.get("/activity", verifyToken, async (req, res) => {
  try {
    console.log("User Role:", req.user.role); // Debugging
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    const result = await pool.query(`
      SELECT bb.id, u.name AS user_name, b.title AS book_title, 
             bb.borrow_date, bb.return_date, bb.status
      FROM borrowed_books bb
      JOIN users u ON bb.user_id = u.id
      JOIN books b ON bb.book_id = b.id
      ORDER BY bb.borrow_date DESC
    `);
    res.json({ message: "User activity fetched ✅", activity: result.rows });
  } catch (err) {
    console.error("Fetch Activity Error:", err);
    res.status(500).json({ error: "Server error ❌" });
  }
});

module.exports = router;