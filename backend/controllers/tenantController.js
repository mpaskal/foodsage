const Tenant = require("../models/Tenant");
const User = require("../models/User");

// Function to get all tenants
const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Function to create a new tenant
const createTenant = async (req, res) => {
  const { name } = req.body;

  try {
    let tenant = new Tenant({ name });
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Function to delete a tenant and all associated users
const deleteTenantAndUsers = async (req, res) => {
  const tenantId = req.params.id; // Assume tenantId is passed as a URL parameter

  try {
    // Delete all users associated with the tenant
    await User.deleteMany({ tenantId });

    // Delete the tenant
    await Tenant.findByIdAndDelete(tenantId);

    res.json({ msg: "Tenant and associated users deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Function to get a specific tenant
const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ msg: "Tenant not found" });
    }
    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Function to update a tenant
const updateTenant = async (req, res) => {
  const { name } = req.body;

  try {
    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ msg: "Tenant not found" });
    }

    tenant.name = name;
    await tenant.save();

    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getAllTenants,
  createTenant,
  deleteTenantAndUsers,
  getTenantById,
  updateTenant,
};
