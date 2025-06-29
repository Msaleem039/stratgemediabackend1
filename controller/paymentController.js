import Stripe from "stripe";
import { asyncHandler } from "../utlils/globalutils.js";

// Initialize Stripe with your secret key
const stripe = new Stripe("sk_test_51RSCwPE0TZDAfKhx9JNCx2VfnCC65OXUiWuJyOy7qUPleOf1w8Xmzlg0QXkHH9OrDNLBfapv4Ktb4J7Z9hVu7aZz008KPEhpfX"); // Make sure your env variable is set

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  // Check if amount is provided
  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  // Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // convert dollars to cents
    currency,
    automatic_payment_methods: { enabled: true },
  });

  res.status(200).json({ clientSecret: paymentIntent.client_secret });
});
