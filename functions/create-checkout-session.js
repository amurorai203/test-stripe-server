const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event, context) {
const allowedOrigins = [
  'http://localhost:5173',
  'https://testupl.netlify.app',
  'https://test-stripe-frontend.netlify.app'
];
  
const origin = event.headers.origin;

const isAllowed = allowedOrigins.includes(origin);

  // ✅ Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : '',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // ✅ Reject other methods
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
      },
      body: 'Method Not Allowed',
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Sample Items' },
            unit_amount: 50100,
          },
          quantity: 1,
        },
      ],
      success_url: `${allowedOrigin}/success`,
      cancel_url: `${allowedOrigin}/cancel`,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
