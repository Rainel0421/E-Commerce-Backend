// backend/controllers/product.controller.js
const catchAsync = require("../utils/catchAsync");
const productService = require("../services/product.service");

exports.getProducts = catchAsync(async (req, res) => {
  // ✅ Extrae los filtros de los parámetros de query
  const { category, search } = req.query;
  
  const products = await productService.getAllProducts({ 
    category, 
    search 
  });
  
  res.status(200).json({ success: true, data: products });
});

exports.getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

exports.createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).send();
});