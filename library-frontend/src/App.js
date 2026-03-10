import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./Auth";
import AdminBorrowedBooks from "./AdminDashBoard";
import User from "./UserDashBoard";
import { BorrowedBooksProvider } from "./BorrowedBooksContext";
import { BooksProvider } from "./BooksContext"; // Import BooksProvider

// PrivateRoute for route protection
function PrivateRoute({ element, adminOnly }) {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token) return <Navigate to="/" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/user" replace />;

  return element;
}

function App() {
  return (
    <BooksProvider>
      <BorrowedBooksProvider>
        <Routes>
          <Route path="/" element={<Auth />} />

          {/* Borrowed books page */}
          <Route 
            path="/borrowed-books" 
            element={<PrivateRoute element={<User />} />} 
          />

          {/* Admin page */}
          <Route 
            path="/admin" 
            element={<PrivateRoute element={<AdminBorrowedBooks />} adminOnly />} 
          />
        </Routes>
      </BorrowedBooksProvider>
    </BooksProvider>
  );
}

export default App;
