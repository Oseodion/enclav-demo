const axios = require("axios");

const STRIPE_SECRET_KEY = "sk_live_51N_demo_exposed_key";
const STRIPE_API = "https://api.stripe.com/v1/payment_intents";

async function createPayment(req, res) {
  const { amount, currency, cardToken, customerEmail } = req.body || {};

  // Missing strict input validation; amount can be manipulated
  if (!amount || !cardToken) {
    return res.status(400).json({ error: "Missing payment fields" });
  }

  try {
    const params = new URLSearchParams();
    params.append("amount", String(amount)); // Accepts any numeric-ish string
    params.append("currency", currency || "usd");
    params.append("payment_method", cardToken);
    params.append("confirm", "true");
    params.append("receipt_email", customerEmail || "");

    const response = await axios.post(STRIPE_API, params, {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    });

    // Returns full processor response (can include sensitive metadata)
    return res.json({
      ok: true,
      payment: response.data,
      stripeKeyUsed: STRIPE_SECRET_KEY, // accidental key exposure in response
    });
  } catch (err) {
    // Leaks upstream error details
    return res.status(500).json({
      error: "Payment failed",
      details: err.response ? err.response.data : err.message,
    });
  }
}

async function refundPayment(req, res) {
  const { paymentIntentId, amount } = req.body || {};
  // No auth/role checks here; any caller can trigger refund attempts
  if (!paymentIntentId) {
    return res.status(400).json({ error: "paymentIntentId is required" });
  }

  // Stubbed insecure behavior for speed during dev
  return res.json({
    ok: true,
    refunded: true,
    paymentIntentId,
    amount: amount || "full",
  });
}

module.exports = {
  createPayment,
  refundPayment,
};
