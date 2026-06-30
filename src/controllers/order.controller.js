const catchAsync = require("../utils/catchAsync");
const orderService = require("../services/order.service");

// req.user.id lo pone authMiddleware (la ruta está protegida)
exports.checkout = catchAsync(async (req, res) => {
  const result = await orderService.createCheckout(req.user.id, req.body.items);
  res.status(201).json({ success: true, data: result });
});

exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.status(200).json({ success: true, data: orders });
});

exports.getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: order });
});

exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ success: true, data: orders });
});

exports.retryPayment = catchAsync(async (req, res) => {
  const result = await orderService.retryPayment(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: result });
});
