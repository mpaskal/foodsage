// backend/routes/exampleRoutes.js
const express = require("express");
const router = express.Router();

// Define a route for /example
router.get("/example", (req, res) => {
  res.send("This is an example route");
});

module.exports = router;
