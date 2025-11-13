import Stripe from 'stripe';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    // MODIFIED: Destructure paymentMethodType from the request body
    const { amount, stripeSecretKey, currency, paymentMethodType } = await request.json();

    if (!stripeSecretKey) {
        return json({ error: 'Stripe secret key is not configured.' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects the amount in cents
            currency: currency.toLowerCase() || 'usd',
            // MODIFIED: Use the passed paymentMethodType, defaulting to 'card' if not specified.
            payment_method_types: [paymentMethodType || 'card'],
        });

        return json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        return json({ error: error.message }, { status: 500 });
    }
}
