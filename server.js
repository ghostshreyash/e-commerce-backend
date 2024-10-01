const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

// Ensure that Stripe secret key is defined
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe
const app = express();

// CORS configuration - Only allow your frontend domain
app.use(cors({
    origin: 'https://e-mart-shopping.netlify.app', // Replace with your frontend URL
    methods: ['POST'], // Allow only POST requests
}));

app.use(bodyParser.json()); // Parse JSON request body

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    const { amount } = req.body;

    try {
        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create a checkout session using Stripe API
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Powdur', // Example product name
                        },
                        unit_amount: amount, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://e-mart-shopping.netlify.app/success', // Redirect on success
            cancel_url: 'https://e-mart-shopping.netlify.app/cancel', // Redirect on cancel
        });

        // Respond with session ID for the frontend to use
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Server setup - Define PORT
const PORT = process.env.PORT || 5000; // Use environment port if available
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
