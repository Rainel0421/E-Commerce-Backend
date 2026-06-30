const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

class UploadService {
  // Sube un buffer en memoria a Cloudinary usando un stream.
  uploadImage(fileBuffer, folder = "products") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Limita tamaño y comprime automáticamente
          transformation: [
            { width: 1200, height: 1200, crop: "limit", quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(
              new ApiError(500, "Error al subir la imagen a Cloudinary"),
            );
          }
          resolve(result);
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId) {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  }

  // Extrae el public_id de una URL de Cloudinary para poder borrarla después
  extractPublicId(url) {
    if (!url || !url.includes("cloudinary")) return null;
    const parts = url.split("/");
    const fileWithExt = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const fileName = fileWithExt.split(".")[0];
    return `${folder}/${fileName}`;
  }
}

module.exports = new UploadService();
