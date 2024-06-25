const Tenant = require("../models/Tenant");

// Function to get all tenants
const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Add more tenant-related functions here

module.exports = {
  getAllTenants,
  createTenant,
  // Export other functions here
};
