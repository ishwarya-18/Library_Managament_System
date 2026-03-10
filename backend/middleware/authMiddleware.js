const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required ❌" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token ❌" });
    }
    req.user = decoded; // Store user data in the request
    console.log("User ID:", req.user.id); // Debugging
    next(); // Proceed to the next middleware
  });
};

module.exports = verifyToken;