import React, { useState } from "react";
import LibraryApp from "./LibraryApp";
import UserDetails from "./UserDetails";
import BorrowedBooks from "./AdminActivity";
import "./AdminDashBoard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("library");

  return (
    <div
     className="admin-dashboard">
    <h1 className="library-title">Library Management</h1>
      <nav className="admin-navbar">
        <button onClick={() => setActiveTab("library")} className={activeTab === "library" ? "active" : ""}>Library Management</button>
        <button onClick={() => setActiveTab("users")} className={activeTab === "users" ? "active" : ""}>User Details</button>
        <button onClick={() => setActiveTab("borrowed")} className={activeTab === "borrowed" ? "active" : ""}>Borrowed Books</button>
      </nav>

      <div className="admin-content">
        {activeTab === "library" && <LibraryApp />}
        {activeTab === "users" && <UserDetails />}
        {activeTab === "borrowed" && <BorrowedBooks />}
      </div>
    </div>
  );
};

export default AdminDashboard;