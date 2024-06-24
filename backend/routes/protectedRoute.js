const express = require("express");
const authenticate = require("../middlewares/authenticate");
const tenantMiddleware = require("../middlewares/tenantMiddleware");

const router = express.Router();

router.post(
  "/create-something",
  authenticate,
  tenantMiddleware,
  async (req, res) => {
    const { data } = req.body;

    // Example: Creating a new record associated with the tenant
    const newRecord = new Record({
      data,
      tenantId: req.tenantId,
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  }
);

module.exports = router;
