const express = require("express");
const router = express.Router();
const {
  getAllTenants,
  createTenant,
  deleteTenantAndUsers,
  getTenantById,
  updateTenant,
} = require("../controllers/tenantController");
const userAuth = require("../middlewares/userAuth");

// GET /api/tenants
router.get("/", userAuth, getAllTenants);

// POST /api/tenants
router.post("/", userAuth, createTenant);

// DELETE /api/tenants
router.delete("/", userAuth, deleteTenantAndUsers);

// GET /api/tenants/:id
router.get("/:id", userAuth, getTenantById);

// PUT /api/tenants/:id
router.put("/:id", userAuth, updateTenant);

module.exports = router;
