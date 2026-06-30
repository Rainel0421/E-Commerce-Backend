const express = require('express');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

// Público: el frontend manda [{ productId, quantity }] y recibe el carrito
// con precios reales, total y avisos. El login se exige luego, en el checkout.
router.post('/summary', cartController.getCartSummary);

module.exports = router;