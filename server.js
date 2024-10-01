const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT = 5000 || process.env.PORT ; 
const app = express();

app.use(cors());
app.use(bodyParser.json());


app.post('/create-checkout-session', async (req, res) => {
    const { amount } = req.body;

    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'E-mart porducx',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://e-mart-shopping.netlify.app/success',
            cancel_url: 'https://e-mart-shopping.netlify.app/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
