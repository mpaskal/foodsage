const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.memoryStorage();

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

// Combine the two upload declarations
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadMiddleware = (req, res, next) => {
  upload.single("image")(req, res, function (err) {
    console.log("req middleware", req.body);
    console.log("err middleware", err);
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res
        .status(400)
        .json({ message: "Error uploading file", error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res
        .status(400)
        .json({ message: "Unknown Error uploading file", error: err.message });
    }

    // If there is a file, convert it to base64 and add to req.body
    if (req.file) {
      const fileBuffer = req.file.buffer;
      req.body.image = fileBuffer.toString("base64");
    }

    // Parse JSON strings in req.body
    for (let key in req.body) {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch (e) {
        // If it's not a JSON string, keep the original value
      }
    }

    // Everything went fine.
    next();
  });
};

module.exports = uploadMiddleware;
