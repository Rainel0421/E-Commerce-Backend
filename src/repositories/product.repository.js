const prisma = require("../config/database");

class ProductRepository {
  findAll() {
    return prisma.product.findMany({
      include: { category: true },
    });
  }

  findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  // Trae varios productos por sus IDs en UNA sola consulta (lo usa el carrito).
  // Evita el problema "N+1" de hacer una consulta por cada producto.
  findManyByIds(ids) {
    return prisma.product.findMany({ where: { id: { in: ids } } });
  }

  create(data) {
    return prisma.product.create({ data });
  }

  update(id, data) {
    return prisma.product.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.product.delete({ where: { id } });
  }
}

module.exports = new ProductRepository();
