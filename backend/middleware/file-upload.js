// const multer = require("multer");
// const { v4: uuid } = require("uuid");

// const MIME_TYPE_MAP = {
//   "image/png": "png",
//   "image/jpeg": "jpeg",
//   "image/jpg": "jpg",
// };

// const fileUpload = multer({
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/images");
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuid() + "." + ext);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error("Invalid mime type.");
//     cb(error, isValid);
//   },
// });

// module.exports = fileUpload;


// backend/middleware/upload.js
// Simple multer setup to store images in backend/uploads/images
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads/images exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
fs.mkdirSync(uploadDir, { recursive: true });

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  }
});

// file filter - accept images only
const fileFilter = (req, file, cb) => {
  console.log('--- In multer fileFilter ---');
  console.log('File:', file);
  if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;