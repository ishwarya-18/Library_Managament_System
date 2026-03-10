const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();
// 📌 Add a new book
router.post("/add", verifyToken, async (req, res) => {
    const { title, author, description, published_year } = req.body;

    if (!title || !author || !description || !published_year) {
        return res.status(400).json({ error: "All fields are required ❌" });
    }

    try {
        const newBook = await pool.query(
            "INSERT INTO books (title, author, description, published_year) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, author, description, published_year]
        );
        res.json({ message: "Book added ✅", book: newBook.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

// 📌 Get all books
router.get("/", async (req, res) => {
    try {
        const books = await pool.query("SELECT * FROM books");
        res.json({ message: "Books fetched ✅", books: books.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

// 📌 Update book details
router.put("/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, author, description, published_year } = req.body;

    try {
        const updatedBook = await pool.query(
            "UPDATE books SET title=$1, author=$2, description=$3, published_year=$4 WHERE id=$5 RETURNING *",
            [title, author, description, published_year, id]
        );
        if (updatedBook.rows.length === 0) {
            return res.status(404).json({ message: "Book not found ❌" });
        }
        res.json({ message: "Book updated ✅", book: updatedBook.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

// 📌 Delete a book
router.delete("/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBook = await pool.query("DELETE FROM books WHERE id=$1 RETURNING *", [id]);
        if (deletedBook.rows.length === 0) {
            return res.status(404).json({ message: "Book not found ❌" });
        }
        res.json({ message: "Book deleted ✅", book: deletedBook.rows[0] });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Server error ❌" });
    }
});// 📌 Borrow a book
router.post("/borrow", verifyToken, async (req, res) => {
  const { book_id } = req.body;
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: "User authentication required ❌" });
  }

  try {
    // Check if the book exists and is available
   // Check if the book exists and is available
const bookExists = await pool.query("SELECT * FROM books WHERE id = $1 AND borrowed = false LIMIT 1", [book_id]);
if (bookExists.rows.length === 0) {
  return res.status(404).json({ message: "Book not available ❌" });
}

    // Insert into borrowed_books table
    const borrowBook = await pool.query(
      `INSERT INTO borrowed_books (user_id, book_id, borrow_date, due_date, status) 
       VALUES ($1, $2, NOW(), NOW() + INTERVAL '14 days', 'borrowed') 
       RETURNING *`,
      [user_id, book_id]
    );

    // ✅ Update book status to borrowed
    await pool.query("UPDATE books SET borrowed = true WHERE id = $1", [book_id]);

    res.status(201).json({
      message: "Book borrowed successfully ✅",
      borrowed_book: borrowBook.rows[0],
      due_date: borrowBook.rows[0].due_date,
    });
  } catch (err) {
    console.error("Borrow Error:", err);
    res.status(500).json({ error: "Server error ❌" });
  }
});
  // 📌 Return a borrowed book
router.put("/return/:book_id", verifyToken, async (req, res) => {
    const { book_id } = req.params;
    const user_id = req.user.id;

    try {
        const checkQuery = `SELECT * FROM borrowed_books WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL`;
        const checkResult = await pool.query(checkQuery, [user_id, book_id]);

        if (checkResult.rows.length === 0) {
            return res.status(400).json({ message: "No active borrowing record found ❌" });
        }

        const returnQuery = `
            UPDATE borrowed_books
            SET return_date = NOW(), 
                penalty = GREATEST(0, EXTRACT(DAY FROM NOW() - due_date) * 10),
                status = 'returned'
            WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL
            RETURNING *`;
        const returnResult = await pool.query(returnQuery, [user_id, book_id]);

        if (returnResult.rowCount === 0) {
            return res.status(404).json({ error: "No active borrow record found ❌" });
        }

        // ✅ Update book status to available
        await pool.query("UPDATE books SET borrowed = false WHERE id = $1", [book_id]);

        res.json({
            message: "Book returned successfully ✅",
            returned_book: returnResult.rows[0],
            penalty: returnResult.rows[0].penalty,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

// 📌 Get borrowed books
router.get("/borrowed", verifyToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query(
            `SELECT books.* FROM borrowed_books 
             JOIN books ON borrowed_books.book_id = books.id 
             WHERE borrowed_books.user_id = $1 AND borrowed_books.return_date IS NULL`,
            [user_id]
        );
        res.json({ message: "Borrowed books fetched ✅", books: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

// 📌 Get all borrowed books with pagination and status filter
router.get("/borrowed-books", verifyToken, async (req, res) => {
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    try {
        let query = `SELECT books.id, books.title, books.author, bb.borrow_date, bb.return_date
                     FROM borrowed_books bb
                     JOIN books ON bb.book_id = books.id
                     WHERE bb.user_id = $1`;

        if (status === "active") {
            query += " AND bb.return_date IS NULL";
        } else if (status === "returned") {
            query += " AND bb.return_date IS NOT NULL";
        }

        query += " ORDER BY bb.borrow_date DESC LIMIT $2 OFFSET $3";

        const borrowedBooks = await pool.query(query, [req.user.id, limit, offset]);

        res.json({
            message: "Borrowed books fetched ✅",
            books: borrowedBooks.rows,
            currentPage: page,
            perPage: limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

router.get("/returned-books", verifyToken, async (req, res) => {
    try {
        const returnedBooks = await pool.query(
            `SELECT books.id, books.title, books.author
             FROM borrowed_books 
             JOIN books ON borrowed_books.book_id = books.id 
             WHERE borrowed_books.user_id = $1 
             AND borrowed_books.return_date IS NOT NULL`,
            [req.user.id]
        );

        res.json({ message: "Returned books fetched ✅", books: returnedBooks.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error ❌" });
    }
});

module.exports = router;
