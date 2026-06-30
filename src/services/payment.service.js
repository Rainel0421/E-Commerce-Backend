const stripe = require("../config/stripe");

class PaymentService {
  // Crea una sesión de Stripe Checkout a partir de los items de la orden.
  // Stripe trabaja en centavos, por eso multiplicamos por 100.
  async createCheckoutSession({ order, items }) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd", // cámbialo a tu moneda si quieres (ej. 'mxn')
          product_data: { name: item.name },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      // El orderId viaja en metadata para reconocer la orden en el webhook
      metadata: { orderId: order.id },
      success_url: `${process.env.CLIENT_URL}/checkout/success?order=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
    });
    return session;
  }

  // Verifica que el webhook venga REALMENTE de Stripe (firma criptográfica).
  constructWebhookEvent(rawBody, signature) {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  }
}

module.exports = new PaymentService();
