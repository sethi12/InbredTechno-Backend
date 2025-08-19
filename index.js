// server/index.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3001;
const {
  CASHFREE_CLIENT_ID,
  CASHFREE_CLIENT_SECRET,
  CASHFREE_ENVIRONMENT,
  FRONTEND_URL,
} = process.env;

function getCashfreeBaseUrl() {
  return CASHFREE_ENVIRONMENT?.toUpperCase() === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://api.cashfree.com/pg";
}


async function createCashfreeOrder({
  orderId,
  orderAmount,
  customerId,
  customerEmail,
  customerPhone,
}) {
  const endpoint = `${getCashfreeBaseUrl()}/orders`;

  const payload = {
    order_id: orderId,
    order_amount: orderAmount,
    order_currency: "INR",
    customer_details: {
      customer_id: customerId,
      customer_email: customerEmail,
      customer_phone: customerPhone,
    },
    order_meta: {
      return_url: `https://inbred-techno.vercel.app/Plan`,
    },
  };

  const headers = {
    "x-client-id": process.env.CASHFREE_CLIENT_ID,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
    "x-api-version": "2023-08-01",
    "Content-Type": "application/json",
  };
console.log(CASHFREE_CLIENT_ID+"CAshfre id");

  console.log("🔐 Sending request to:", endpoint);

  const response = await axios.post(endpoint, payload, { headers });
  return response.data;
}

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { order_id, order_amount, customer_id, customer_email, customer_phone } = req.body;

    const orderResponse = await createCashfreeOrder({
      orderId: order_id,
      orderAmount: order_amount,
      customerId: customer_id,
      customerEmail: customer_email,
      customerPhone: customer_phone,
    });

    res.json({
      order_id,
      order_amount,
      payment_session_id: orderResponse.payment_session_id,
    });
  } catch (error) {
    console.error("❌ Cashfree error:", error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: "Failed to create Cashfree order" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

