const Stripe = require("stripe");

// La clave secreta viene del dashboard de Stripe (modo test: sk_test_...)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
