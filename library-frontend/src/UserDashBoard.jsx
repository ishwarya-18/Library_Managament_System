import React, { useState } from "react";
import AvailableBooks from "./AvailableBooks"; // For showing available books
import BorrowedBooks from "./BorrowedBooks"; // For showing borrowed books
import UserProfile from "./UserProfile"; // For showing user details
import "./UserDashBoard.css"; // Style for the dashboard

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("available"); // Default tab
  console.log("Current Tab:", activeTab);

  return (
    <div className="user-dashboard">
      <h1 className="dashboard-title">User Dashboard</h1>
      
      {/* Navigation Menu */}
      <nav className="user-navbar">
        <button onClick={() => setActiveTab("available")} className={activeTab === "available" ? "active" : ""}>
          Available Books
        </button>
        <button onClick={() => setActiveTab("borrowed")} className={activeTab === "borrowed" ? "active" : ""}>
          Borrowed Books
        </button>
        <button onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? "active" : ""}>
          User Profile
        </button>
      </nav>

      {/* Content Section */}
      <div className="user-content">
        {activeTab === "available" && <AvailableBooks />}
        {activeTab === "borrowed" && <BorrowedBooks />}
        {activeTab === "profile" && <UserProfile />}
      </div>
    </div>
  );
};

export default UserDashboard;

