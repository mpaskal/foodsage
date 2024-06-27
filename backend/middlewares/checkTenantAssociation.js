module.exports = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(403).json({ msg: "No tenant association" });
  }
  next();
};
