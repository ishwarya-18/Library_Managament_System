import React, { createContext, useState, useCallback } from "react";

export const BooksContext = createContext();

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]); // Available books
  const [borrowedBooks, setBorrowedBooks] = useState([]); // Borrowed books

  const BASE_URL = "http://localhost:5000";

  const fetchBooks = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/books`);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      setBooks(data.books); // Update the books state
    } catch (error) {
      console.error("Error fetching books:", error.message);
    }
  }, []);

  const fetchBorrowedBooks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/api/books/borrowed`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBorrowedBooks(data.books); // Update the borrowedBooks state
      }
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
    }
  }, []);

  return (
    <BooksContext.Provider
      value={{
        books,
        setBooks,
        borrowedBooks,
        setBorrowedBooks,
        fetchBooks,
        fetchBorrowedBooks,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
};