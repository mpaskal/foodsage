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
  wasteItemController.moveWasteItem
); // Changed to use a POST request with 'update' in the path
router.post("/delete", userAuth, wasteItemController.deleteWasteItem);

module.exports = router;
