const orderRepository = require("../repositories/order.repository");
const cartService = require("./cart.service");
const paymentService = require("../services/payment.service");
const ApiError = require("../utils/ApiError");

class OrderService {
  // Crea una orden PENDING desde el carrito y devuelve la URL de pago de Stripe.
  async createCheckout(userId, items) {
    // 1. Revalidamos el carrito contra la DB (precios y stock reales).
    //    Reutilizamos la MISMA lógica del endpoint /cart/summary.
    const summary = await cartService.getCartSummary(items);
    if (!summary.valid) {
      throw new ApiError(
        400,
        "Algunos productos de tu carrito cambiaron. Revísalo e inténtalo de nuevo.",
      );
    }

    // 2. Creamos la orden PENDING con los precios CONGELADOS.
    const order = await orderRepository.create({
      userId,
      total: summary.total,
      items: summary.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.unitPrice, // si el precio sube luego, esta orden no cambia
      })),
    });

    // 3. Creamos la sesión de Stripe y la enlazamos a la orden.
    const session = await paymentService.createCheckoutSession({
      order,
      items: summary.items,
    });
    await orderRepository.setStripeSession(order.id, session.id);

    return { orderId: order.id, checkoutUrl: session.url };
  }

  // Retoma el pago de una orden PENDING ya existente.
  // No crea una orden nueva: reutiliza los items y el total ya congelados.
  async retryPayment(orderId, userId) {
    const order = await orderRepository.findById(orderId);

    if (!order) throw new ApiError(404, "Orden no encontrada");

    // Un usuario solo puede retomar el pago de SU PROPIA orden
    if (order.userId !== userId) {
      throw new ApiError(403, "No tienes acceso a esta orden");
    }

    // Solo tiene sentido retomar el pago si sigue PENDING
    if (order.status !== "PENDING") {
      throw new ApiError(400, "Esta orden ya no está pendiente de pago");
    }

    // Reconstruimos el shape de "items" que espera createCheckoutSession,
    // usando los datos YA CONGELADOS de la orden (no volvemos a consultar precios actuales)
    const items = order.items.map((item) => ({
      name: item.product.name,
      unitPrice: Number(item.price),
      quantity: item.quantity,
    }));

    const session = await paymentService.createCheckoutSession({
      order,
      items,
    });
    await orderRepository.setStripeSession(order.id, session.id);

    return { orderId: order.id, checkoutUrl: session.url };
  }

  getMyOrders(userId) {
    return orderRepository.findByUser(userId);
  }
  getAllOrders() {
    return orderRepository.findAll();
  }
  async getOrderById(id, userId) {
    const order = await orderRepository.findById(id);
    if (!order) throw new ApiError(404, "Orden no encontrada");
    // Un usuario solo puede ver SUS propias órdenes
    if (order.userId !== userId) {
      throw new ApiError(403, "No tienes acceso a esta orden");
    }
    return order;
  }

  // Lo llama el webhook cuando Stripe confirma el pago.
  async markOrderPaid(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) return; // la orden no existe, nada que hacer
    if (order.status === "PAID") return; // ya estaba pagada (no procesar dos veces)
    await orderRepository.markPaidAndDecrementStock(order);
  }
}

module.exports = new OrderService();
