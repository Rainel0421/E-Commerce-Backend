// backend/src/controllers/upload.controller.js
const catchAsync = require("../utils/catchAsync");
const uploadService = require("../services/upload.service");
const ApiError = require("../utils/ApiError");

exports.uploadProductImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No se recibió ningún archivo");
  }

  const result = await uploadService.uploadImage(req.file.buffer, "products");

  res.status(200).json({
    success: true,
    data: {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    },
  });
});
