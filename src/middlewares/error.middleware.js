const multer = require("multer");

module.exports = (err, req, res, next) => {
  // Errores específicos de Multer (ej: archivo muy grande, campo inesperado)
  if (err instanceof multer.MulterError) {
    let message = "Error al subir el archivo";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "La imagen supera el tamaño máximo permitido (5MB)";
    }
    return res.status(400).json({ success: false, message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
};
