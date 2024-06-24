const jwt = require("jsonwebtoken");
const AppAdmin = require("../models/AppAdmin");
require("dotenv").config();

const AppAdminAuth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const AppAdminUser = await AppAdmin.findById(decoded.id);

    if (!AppAdminUser) {
      throw new Error();
    }

    req.AppAdminUser = AppAdminUser;
    next();
  } catch (err) {
    res.status(401).json({ message: "Please authenticate as AppAdmin user" });
  }
};

module.exports = AppAdminAuth;
