const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const wasteItemController = require("../controllers/wasteItemController");

router.get("/", userAuth, wasteItemController.getWasteItems);
router.post(
  "/update/:id",
  userAuth,
  uploadMiddleware,
  wasteItemController.updateWasteItem
);
router.post("/delete", userAuth, wasteItemController.deleteWasteItem);
router.post("/statusConsume/:id", userAuth, wasteItemController.statusConsume);

module.exports = router;
