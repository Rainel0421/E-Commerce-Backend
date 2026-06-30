const express = require("express");
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireRole } = require('../middlewares/auth.middleware');


const router = express.Router();

// Todas requieren estar logueado
router.post("/checkout", authMiddleware, orderController.checkout);
router.post("/:id/retry-payment", authMiddleware, orderController.retryPayment);
router.get("/all", authMiddleware, requireRole("ADMIN"), orderController.getAllOrders); // Solo para ADMIN
router.get("/", authMiddleware, orderController.getMyOrders);
router.get("/:id", authMiddleware, orderController.getOrder);

module.exports = router;
