const prisma = require('../config/database');

class CategoryRepository {
  findAll() {
    return prisma.category.findMany();
  }

  findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: { products: true }, // para poder revisar si tiene productos al borrar
    });
  }

  findByName(name) {
    return prisma.category.findUnique({ where: { name } });
  }

  create(data) {
    return prisma.category.create({ data });
  }

  update(id, data) {
    return prisma.category.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoryRepository();