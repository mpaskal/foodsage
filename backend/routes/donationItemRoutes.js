// src/routes/donationItemRoutes.js

const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const donationItemController = require("../controllers/donationItemController");

router.get("/", userAuth, donationItemController.getDonationItems);
router.post(
  "/update/:id",
  userAuth,
  uploadMiddleware,
  donationItemController.updateDonationItem
);
router.post("/delete", userAuth, donationItemController.deleteDonationItem);
router.post(
  "/markAsDonated/:id",
  userAuth,
  donationItemController.markAsDonated
);

module.exports = router;
