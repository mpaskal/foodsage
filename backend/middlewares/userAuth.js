const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization Header:", authHeader);
  if (!authHeader) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("Token:", token);
  if (!token) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.user = decoded.user;

    const user = await User.findById(req.user.id);
    console.log("Fetched User from userAuth:", user);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    req.user.tenantId = user.tenantId; // Change this line
    console.log("User with tenantId:", req.user);
    next();
  } catch (err) {
    console.error("Error in userAuth:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ msg: "Token has expired", expiredToken: true });
    }
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = userAuth;
