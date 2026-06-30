const categoryRepository = require('../repositories/category.repository');
const ApiError = require('../utils/ApiError');

class CategoryService {
  getAllCategories() {
    return categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new ApiError(404, 'Categoría no encontrada');
    return category;
  }

  async createCategory(data) {
    if (!data.name || data.name.trim() === '') {
      throw new ApiError(400, 'El nombre de la categoría es obligatorio');
    }
    const exists = await categoryRepository.findByName(data.name);
    if (exists) throw new ApiError(409, 'Ya existe una categoría con ese nombre');
    return categoryRepository.create({ name: data.name });
  }

  async updateCategory(id, data) {
    await this.getCategoryById(id); // 404 si no existe
    if (!data.name || data.name.trim() === '') {
      throw new ApiError(400, 'El nombre de la categoría es obligatorio');
    }
    const exists = await categoryRepository.findByName(data.name);
    if (exists && exists.id !== id) {
      throw new ApiError(409, 'Ya existe otra categoría con ese nombre');
    }
    return categoryRepository.update(id, { name: data.name });
  }

  async deleteCategory(id) {
    const category = await this.getCategoryById(id);
    // No dejamos borrar una categoría con productos (si no, Prisma lanza error de FK)
    if (category.products && category.products.length > 0) {
      throw new ApiError(400, 'No puedes eliminar una categoría con productos asociados');
    }
    return categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();