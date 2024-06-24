const jwt = require("jsonwebtoken");
const AdminApp = require("../models/AdminApp");
require("dotenv").config();

const adminAppAuth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminAppUser = await AdminApp.findById(decoded.id);

    if (!adminAppUser) {
      throw new Error();
    }

    req.adminAppUser = adminAppUser;
    next();
  } catch (err) {
    res.status(401).json({ message: "Please authenticate as adminApp user" });
  }
};

module.exports = adminAppAuth;
