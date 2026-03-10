import React, { useState, useEffect } from "react";
import "./AdminActivity.css";

const AdminActivity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "http://localhost:5000";
  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/api/books/admin/activity`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setActivity(data.activity);
        } else {
          setError(data.message || "Failed to fetch activity ❌");
        }
      } catch (error) {
        setError("Server error ❌");
        console.error("Fetch Activity Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="admin-activity-container">
      <h1 className="title">User Activity</h1>

      {loading && <p className="loading">Loading activity...</p>}
      {error && <p className="error-message">{error}</p>}

      <table className="activity-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Book</th>
            <th>Borrow Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((item) => (
            <tr key={item.id}>
              <td>{item.user_name}</td>
              <td>{item.book_title}</td>
              <td>{new Date(item.borrow_date).toLocaleString()}</td>
              <td>
                {item.return_date
                  ? new Date(item.return_date).toLocaleString()
                  : "Not returned"}
              </td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminActivity;