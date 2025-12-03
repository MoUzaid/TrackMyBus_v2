const jwt = require("jsonwebtoken");

const authDriver = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "No token, access denied" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ msg: "Invalid token" });

      req.driver = { id: decoded.id }; 
      next();
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = authDriver;
