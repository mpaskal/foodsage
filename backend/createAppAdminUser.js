const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AppAdmin = require("./models/AppAdmin");
require("dotenv").config();

const db = process.env.MONGO_URI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const createAppAdminUser = async () => {
  const email = "AppAdmin@example.com";
  const password = "AppAdminpassword";
  const loginName = "AppAdmin";
  const firstName = "Admin";
  const lastName = "User";
  const permissions = "full";

  const existingUser = await AppAdmin.findOne({ email });
  if (existingUser) {
    console.log("AppAdmin user already exists");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const appAdminUser = new AppAdmin({
    loginName,
    password: hashedPassword,
    firstName,
    lastName,
    email,
    permissions,
  });

  await appAdminUser.save();
  console.log("AppAdmin user created");
};

createAppAdminUser().then(() => mongoose.disconnect());
