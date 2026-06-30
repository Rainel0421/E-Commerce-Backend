const catchAsync = require('../utils/catchAsync');
const categoryService = require('../services/category.service');

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({ success: true, data: categories });
});

exports.getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).send();
});