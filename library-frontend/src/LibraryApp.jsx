import { useState, useEffect } from "react";
import axios from "axios";
import "./LibraryApp.css";

export default function LibraryApp() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    published_year: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const BASE_URL = "http://localhost:5000";

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!token || isAdmin !== "true") {
      alert("Access denied! Only admins can view this page.");
      window.location.href = "/login";
    }
  }, []);

  // Fetch books from the library API
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/books`)
      .then((response) => {
        setBooks(response.data.books);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setError("Error fetching books. Please try again.");
      });
  }, []);

  // Validate published year
  const isValidYear = (year) => {
    const numericYear = Number(year);
    const currentYear = new Date().getFullYear();
    return numericYear > 0 && numericYear <= currentYear;
  };

  // Handle adding a new book
  const handleAddBook = () => {
    const { title, author, description, published_year } = newBook;

    if (!title || !author || !description || !published_year) {
      return alert("Please fill all fields");
    }

    if (!isValidYear(published_year)) {
      return alert("Please enter a valid published year.");
    }

    axios
      .post(
        `${BASE_URL}/api/books/add`,
        newBook,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      )
      .then((response) => {
        setSuccessMessage("Book added successfully!");
        setNewBook({ title: "", author: "", description: "", published_year: "" });
        setBooks((prevBooks) => [...prevBooks, response.data.book]);
      })
      .catch((error) => {
        console.error("Error adding book:", error);
        setError("Error adding book. Please try again.");
      });
  };

  // Handle deleting a book with confirmation
  const handleDeleteBook = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to delete a book.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true, // Ensure credentials are included
      });

      setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookId));
      setSuccessMessage("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error.response?.data || error);
      setError(error.response?.data?.message || "Error deleting book. Please try again.");
    }
  };

  return (
    <div className="resizable-box">
      <div className="library-container">
        {/* Display success or error messages */}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Add New Book Form */}
        <div className="admin-add-book-form">
          <h3>Add New Book to Library</h3>
          <div className="book-form">
            <input
              className="library-input"
              placeholder="Book Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
              className="library-input"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              className="library-input"
              placeholder="Description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
            />
            <input
              className="library-input"
              type="number"
              placeholder="Published Year"
              value={newBook.published_year}
              onChange={(e) => setNewBook({ ...newBook, published_year: e.target.value })}
            />
            <button className="library-button" onClick={handleAddBook}>
              Add Book
            </button>
          </div>
        </div>

        {/* Display Library Books */}
        <h2 className="library-subtitles">Library Collection</h2>
        <ul className="book-list">
          {books.length > 0 ? (
            books.map((book) => (
              <li key={book.id} className="book-items">
                <strong>
                  {book.title} <span>by {book.author}</span>
                </strong>
                <button className="delete-button" onClick={() => handleDeleteBook(book.id)}>
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="empty-message">No books available</p>
          )}
        </ul>
      </div>
    </div>
  );
}
