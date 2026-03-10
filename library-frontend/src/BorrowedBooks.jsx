import React, { useState, useEffect, useContext } from "react";
import "./BorrowedBooks.css";
import { BooksContext } from "./BooksContext";

const BorrowedBooks = () => {
  const { borrowedBooks, fetchBooks, fetchBorrowedBooks } = useContext(BooksContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:5000";

  const returnBook = async (bookId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/books/return/${bookId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Book returned successfully.");
        await fetchBooks(); // Refresh available books
        await fetchBorrowedBooks(); // Refresh borrowed books
      } else {
        setError(data.detail || "Failed to return the book ❌");
      }
    } catch (error) {
      setError("An error occurred. Please try again ❌");
      console.error("Error returning book:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [fetchBorrowedBooks]);

  return (
    <div className="borrowed-books-container">
      <h1 className="title">Your Borrowed Books</h1>

      {loading && <p className="loading">Loading borrowed books...</p>}
      {error && <p className="error-message">{error}</p>}

      {borrowedBooks.length === 0 ? (
        <p className="empty-message">You have no borrowed books</p>
      ) : (
        <ul className="borrowed-book-list">
          {borrowedBooks.map((book) => (
            <li key={book.id} className="borrowed-book-item">
              <strong>{book.title} by {book.author}</strong>
              <button
                className="return-button"
                onClick={() => returnBook(book.id)}
                disabled={loading}
              >
                Return
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BorrowedBooks;