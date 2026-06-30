const catchAsync = require('../utils/catchAsync');
const cartService = require('../services/cart.service');

exports.getCartSummary = catchAsync(async (req, res) => {
  const summary = await cartService.getCartSummary(req.body.items);
  res.status(200).json({ success: true, data: summary });
});