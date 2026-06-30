// backend/src/routes/upload.routes.js
const express = require("express");
const uploadController = require("../controllers/upload.controller");
const upload = require("../middlewares/upload.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

// Solo ADMIN puede subir imágenes de producto.
// upload.single('image') = espera UN archivo bajo el campo "image" del form-data.
router.post(
  "/product-image",
  authMiddleware,
  requireRole("ADMIN"),
  upload.single("image"),
  uploadController.uploadProductImage,
);

module.exports = router;
