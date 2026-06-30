const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

// Verifica que el usuario esté autenticado (tiene token válido)
const authMiddleware = (req, res, next) => {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No autorizado — token requerido"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role } — disponible en el controller
    next();
  } catch (error) {
    return next(new ApiError(401, "Token inválido o expirado"));
  }
};

// Verifica que el usuario tenga el rol correcto
// Uso: router.post('/', authMiddleware, requireRole('ADMIN'), controller)
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "No tienes permisos para esta acción"));
    }
    next();
  };

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
