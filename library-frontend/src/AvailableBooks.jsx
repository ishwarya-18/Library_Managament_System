import React, { useState, useEffect, useContext } from "react";
import "./AvailableBooks.css";
import { BooksContext } from "./BooksContext";

const LibrarySearch = () => {
  const { books, fetchBooks, fetchBorrowedBooks } = useContext(BooksContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "http://localhost:5000";

  const borrowBook = async (book_id) => {
    console.log("Borrowing book with ID:", book_id); // Debugging
    const token = localStorage.getItem("token");
    if (!token) return setError("You need to log in to borrow books ❌");

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/books/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchBooks(); // Refresh available books
        await fetchBorrowedBooks(); // Refresh borrowed books
      } else {
        setError(data.message || "Failed to borrow book ❌");
      }
    } catch (error) {
      setError("Server error ❌");
      console.error("Borrow Book Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        await fetchBooks();
      } catch (error) {
        setError("Failed to fetch books ❌");
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [fetchBooks]);

  return (
    <div className="librarys-search-container">
      <h1 className="librarys-search-title">Explore Books</h1>
      <input
        className="search-input"
        type="text"
        placeholder="Search for a book..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <h2 className="library-subtitle">Available Books</h2>
      {loading && <p className="loading">Loading books...</p>}
      {error && <p className="error-message">{error}</p>}

      <ul className="book-list">
        {books
          .filter((book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((book) => (
            <li key={book.id} className="books-item">
              <strong>
                {book.title} <span>by {book.author}</span>
              </strong>
              <button
                className="borrow-button"
                onClick={() => borrowBook(book.id)}
                disabled={loading}
              >
                Borrow
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default LibrarySearch;