const paymentService = require("../services/payment.service");
const orderService = require("../services/order.service");

// OJO: aquí NO usamos catchAsync. A Stripe hay que responderle de forma
// específica (200 si todo bien, 400 si la firma falla).
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    // req.body es el body CRUDO (Buffer), gracias a express.raw en la ruta.
    event = paymentService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    // Firma inválida o body manipulado -> 400 para que Stripe lo sepa
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Solo nos importa cuando el pago se completa
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    await orderService.markOrderPaid(orderId);
  }

  // Confirmamos a Stripe que recibimos el evento (si no, lo reintenta)
  res.status(200).json({ received: true });
};
