const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.service");

exports.register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

exports.getMe = catchAsync(async (req, res) => {
  // req.user.id lo pone el middleware de auth (siguiente archivo)
  const user = await authService.getMe(req.user.id);
  res.status(200).json({ success: true, data: user });
});
