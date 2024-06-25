const jwt = require("jsonwebtoken");
const AppAdmin = require("../models/User");
require("dotenv").config();

const appAdminAuth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const appAdmin = await AppAdmin.findById(decoded.id);

    if (!appAdmin || appAdmin.role !== "appAdmin") {
      throw new Error();
    }

    req.user = appAdmin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Please authenticate as AppAdmin user" });
  }
};

module.exports = appAdminAuth;
