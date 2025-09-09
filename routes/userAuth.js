const jwt = require("jsonwebtoken");

const authenthicateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, "bookrecommend123", (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token is invalid or expired. Please sign in again." });
    }
    req.user = user; // decoded payload (id, email, etc.)
    next();
  });
};

module.exports = { authenthicateToken };
