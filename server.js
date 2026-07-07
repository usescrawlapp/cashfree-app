// server.js
// This is the main server for Render deployment.
// It serves the HTML page AND handles the Cashfree API calls (server-side,
// so the Secret Key is never exposed to the browser).

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Config from environment variables (set these in Render dashboard) ---
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const ENV = process.env.CASHFREE_ENV || 'TEST'; // "TEST" or "PROD"
const SITE_URL = process.env.SITE_URL; // e.g. https://your-app.onrender.com

function cashfreeBaseUrl() {
  return ENV === 'PROD'
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';
}

// --- Create Order endpoint ---
app.post('/api/create-order', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const siteUrl = SITE_URL || `https://${req.get('host')}`;
    const orderId = 'order_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

    const payload = {
      order_id: orderId,
      order_amount: 1.00,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'cust_' + Date.now(),
        customer_name: name,
        customer_email: email,
        customer_phone: '9999999999'
      },
      order_meta: {
        return_url: `${siteUrl}/?order_id={order_id}`
      }
    };

    const cfRes = await fetch(cashfreeBaseUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY
      },
      body: JSON.stringify(payload)
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok) {
      console.error('Cashfree order creation failed:', cfData);
      return res.status(cfRes.status).json({
        error: cfData.message || 'Cashfree order creation failed',
        details: cfData
      });
    }

    return res.json({
      payment_session_id: cfData.payment_session_id,
      order_id: orderId,
      environment: ENV === 'PROD' ? 'production' : 'sandbox'
    });

  } catch (err) {
    console.error('Server error in create-order:', err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Verify Order endpoint ---
app.get('/api/verify-order', async (req, res) => {
  try {
    const orderId = req.query.order_id;

    if (!orderId) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    const url = ENV === 'PROD'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const cfRes = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY
      }
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok) {
      console.error('Cashfree verify failed:', cfData);
      return res.status(cfRes.status).json({ error: cfData.message || 'Could not fetch order status' });
    }

    return res.json({
      order_status: cfData.order_status,
      customer_name: cfData.customer_details ? cfData.customer_details.customer_name : null,
      customer_email: cfData.customer_details ? cfData.customer_details.customer_email : null,
      order_amount: cfData.order_amount
    });

  } catch (err) {
    console.error('Server error in verify-order:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
