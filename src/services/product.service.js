// backend/services/product.service.js
const productRepository = require("../repositories/product.repository");
const categoryRepository = require("../repositories/category.repository");
const ApiError = require("../utils/ApiError");

class ProductService {
  //  Recibe filtros opcionales
  async getAllProducts(filters = {}) {
    const { category, search } = filters;
    let products = await productRepository.findAll();

    // Filtro por categoría
    if (category) {
      products = products.filter(p => p.categoryId === category);
    }

    // Filtro por búsqueda
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return products;
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, "Producto no encontrado");
    }
    return product;
  }

  async createProduct(data) {
    const { name, description, price, stock, imageUrl, categoryId } = data;

    if (!name || name.trim() === "") {
      throw new ApiError(400, "El nombre es obligatorio");
    }
    if (price == null || Number(price) <= 0) {
      throw new ApiError(400, "El precio debe ser mayor a 0");
    }
    if (stock == null || Number(stock) < 0) {
      throw new ApiError(400, "El stock no puede ser negativo");
    }
    if (!categoryId) {
      throw new ApiError(400, "La categoría es obligatoria");
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "La categoría indicada no existe");
    }

    return productRepository.create({
      name,
      description: description || "",
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl || null,
      categoryId,
    });
  }

  async updateProduct(id, data) {
    await this.getProductById(id);

    const updateData = {};

    if (data.name !== undefined) {
      if (data.name.trim() === "")
        throw new ApiError(400, "El nombre no puede estar vacío");
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.price !== undefined) {
      if (Number(data.price) <= 0)
        throw new ApiError(400, "El precio debe ser mayor a 0");
      updateData.price = Number(data.price);
    }
    if (data.stock !== undefined) {
      if (Number(data.stock) < 0)
        throw new ApiError(400, "El stock no puede ser negativo");
      updateData.stock = Number(data.stock);
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }
    if (data.categoryId !== undefined) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) throw new ApiError(404, "La categoría indicada no existe");
      updateData.categoryId = data.categoryId;
    }

    return productRepository.update(id, updateData);
  }

  async deleteProduct(id) {
    await this.getProductById(id);
    return productRepository.delete(id);
  }

  async checkStock(productId, quantity) {
    const product = await this.getProductById(productId);
    if (product.stock < quantity) {
      throw new ApiError(
        400,
        `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
      );
    }
    return true;
  }
}

module.exports = new ProductService();