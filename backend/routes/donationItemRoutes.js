const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const donationItemController = require("../controllers/donationItemController");

router.get("/items", userAuth, donationItemController.getDonationItems);
router.post(
  "/items/update/:id",
  userAuth,
  uploadMiddleware,
  donationItemController.updateDonationItem
);
router.post(
  "/items/delete",
  userAuth,
  donationItemController.deleteDonationItem
);

// To add donation insights later
// router.get("/insights", userAuth, donationItemController.getDonationInsights);

module.exports = router;
