const express = require("express");
const router = express.Router();
const Tenant = require("../models/Tenant");

// @route   GET api/tenants
// @desc    Get all tenants
// @access  Public
router.get("/", async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
