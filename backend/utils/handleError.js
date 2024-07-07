const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(400).json({ message, error: error.message });
};

module.exports = handleError;
