const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");

// Define routes and attach controller functions
router.get("/", tenantController.getAllTenants);
router.post("/", tenantController.createTenant);

// Add more routes here if necessary

module.exports = router;
