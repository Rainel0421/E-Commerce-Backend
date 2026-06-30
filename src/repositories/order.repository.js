const prisma = require("../config/database");

class OrderRepository {
  // Crea la orden Y sus items en UNA sola operación atómica (nested create).
  // Si algo falla, no queda una orden a medias.
  create({ userId, total, items }) {
    return prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price, // precio congelado del momento
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  findByUser(userId) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
  
  // Para el panel admin: TODAS las órdenes de TODOS los usuarios.
  // Incluimos los datos básicos del usuario (sin password) para mostrar quién compró.
  findAll() {
    return prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  setStripeSession(id, stripeSessionId) {
    return prisma.order.update({ where: { id }, data: { stripeSessionId } });
  }

  // Marca PAID y descuenta el stock de cada producto, todo dentro de una
  // transacción: o se aplican todos los cambios, o ninguno.
  markPaidAndDecrementStock(order) {
    return prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    ]);
  }
}

module.exports = new OrderRepository();
