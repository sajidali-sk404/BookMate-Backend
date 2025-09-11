// middleware/auth.js
const jwt = require("jsonwebtoken");

const authenthicateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalid or expired" });
    }
    req.user = user; // { id, email, role }
    next();
  });
};

module.exports = { authenthicateToken };
