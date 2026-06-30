const express = require("express");
const webhookController = require("../controllers/webhook.controller");

const router = express.Router();

// express.raw: Stripe firma el body sin parsear; necesitamos el Buffer original.
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook,
);

module.exports = router;
