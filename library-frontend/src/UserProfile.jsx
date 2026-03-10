import React, { useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi"; // Importing logout icon
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [learntBooks, setLearntBooks] = useState([]);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    fetchUserProfile();
    fetchReturnedBooks(); // Fetch learned books (returned books)
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchReturnedBooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/books/returned-books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLearntBooks(data.books);
      } else {
        console.error("Failed to fetch returned books");
      }
    } catch (error) {
      console.error("Error fetching returned books:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="user-profile-container">
      <h1>User Profile</h1>
      <div>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <h2>Learned Books</h2>
      <ul>
        {learntBooks.length > 0 ? (
          learntBooks.map((book) => (
            <li key={book.id}>{book.title} by {book.author}</li>
          ))
        ) : (
          <p>No books learned yet.</p>
        )}
      </ul>

      <button onClick={handleLogout} className="custom-logout-button">
  Logout
</button>

    </div>
  );
};

export default UserProfile;
