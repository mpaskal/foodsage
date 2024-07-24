const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure that decoded.user exists
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: "Invalid token structure" });
    }

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.user = {
      id: user._id,
      tenantId: user.tenantId,
      // Add any other user properties you need
    };

    next();
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        msg: "Token has expired",
        expiredToken: true,
      });
    }
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = userAuth;
