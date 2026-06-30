const multer = require('multer');
const ApiError = require('../utils/ApiError');

// memoryStorage: el archivo queda en RAM como buffer, NO se guarda en disco.
// Es lo correcto aquí porque solo necesitamos el buffer para reenviarlo a
// Cloudinary; nunca queremos persistir archivos en nuestro propio servidor
// (Render/Railway borran el disco en cada redeploy).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Solo se permiten imágenes JPG, PNG o WEBP'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por imagen
  },
});

module.exports = upload;