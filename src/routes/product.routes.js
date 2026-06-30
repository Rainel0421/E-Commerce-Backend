const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Públicas: cualquiera puede ver productos
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Solo ADMIN
router.post('/', authMiddleware, requireRole('ADMIN'), productController.createProduct);
router.patch('/:id', authMiddleware, requireRole('ADMIN'), productController.updateProduct);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), productController.deleteProduct);

module.exports = router;