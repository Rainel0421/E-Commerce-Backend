const express = require('express');
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Públicas: cualquiera puede ver las categorías
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Solo ADMIN (esto arregla el hueco de seguridad: antes el POST estaba abierto)
router.post('/', authMiddleware, requireRole('ADMIN'), categoryController.createCategory);
router.patch('/:id', authMiddleware, requireRole('ADMIN'), categoryController.updateCategory);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), categoryController.deleteCategory);

module.exports = router;