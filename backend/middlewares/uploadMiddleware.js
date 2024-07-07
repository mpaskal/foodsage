const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    console.log("req middleware", req.body);
    console.log("err middleware", err);
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: "Error uploading file", err });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res
        .status(400)
        .json({ message: "Unknown Error uploading file", err });
    }

    // If there is a file, convert it to base64 and add to req.body
    if (req.file) {
      const fileBuffer = req.file.buffer;
      req.body.image = fileBuffer.toString("base64");
    }

    // Convert req.body from FormData to an object if needed
    req.body = Object.fromEntries(new Map(Object.entries(req.body)));

    // Everything went fine.
    next();
  });
};

module.exports = uploadMiddleware;
