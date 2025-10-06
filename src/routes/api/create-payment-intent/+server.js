import Stripe from 'stripe';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { amount, stripeSecretKey, currency } = await request.json();

    if (!stripeSecretKey) {
        return json({ error: 'Stripe secret key is not configured.' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects the amount in cents
            currency: currency.toLowerCase() || 'usd',
            payment_method_types: ['card'],
        });

        return json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        return json({ error: error.message }, { status: 500 });
    }
}
