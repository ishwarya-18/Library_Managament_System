// src/pages/UserDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDetails.css'; // Importing the CSS file

const UserDetailsPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
// Fetch users from backend (only accessible by admins)
axios.get("http://localhost:5000/api/auth/users", {
  headers: {
    Authorization: `Bearer ${token}` // Correct token format
  },
  withCredentials: true // Ensure cookies (if used) are included
})

      .then((response) => {
        setUsers(response.data.users); // Store users in state
      })
      .catch((error) => {
        setError(error.response?.data?.message || 'Error fetching users');
      });
  }, []);

  return (
    <div>
      <h1 className='title'>User Details</h1>
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>User Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.user_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDetailsPage;
