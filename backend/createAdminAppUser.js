const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AdminApp = require("./models/AdminApp");
require("dotenv").config();

const db = process.env.MONGO_URI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const createAdminAppUser = async () => {
  const email = "paskalm@rogers.com";
  const password = "foodsage";
  const loginName = "adminApp";
  const firstName = "AdminApp";
  const lastName = "User";
  const permissions = "full";

  const existingUser = await AdminApp.findOne({ email });
  if (existingUser) {
    console.log("AdminApp user already exists");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const adminAppUser = new AdminApp({
    loginName,
    password: hashedPassword,
    firstName,
    lastName,
    email,
    permissions,
  });

  await adminAppUser.save();
  console.log("AdminApp user created");
};

createAdminAppUser().then(() => mongoose.disconnect());
