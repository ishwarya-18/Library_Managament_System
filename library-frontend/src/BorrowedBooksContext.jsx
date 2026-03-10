import React, { createContext, useState, useContext } from "react";

// Create a Context for borrowed books
const BorrowedBooksContext = createContext();

// Custom hook to use borrowed books context
export const useBorrowedBooks = () => {
  return useContext(BorrowedBooksContext);
};

// BorrowedBooksProvider to wrap components that need access to the borrowed books
export const BorrowedBooksProvider = ({ children }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  return (
    <BorrowedBooksContext.Provider value={{ borrowedBooks, setBorrowedBooks }}>
      {children}
    </BorrowedBooksContext.Provider>
  );
};
