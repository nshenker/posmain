<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js';
    import { showToast } from '../toastStore.js';

    export let publishableKey;
    export let clientSecret;

    const dispatch = createEventDispatcher();
    let stripe;
    let cardElement;
    let loading = false;

    onMount(async () => {
        stripe = await loadStripe(publishableKey);
        const elements = stripe.elements();
        cardElement = elements.create('card');
        cardElement.mount('#card-element');
    });

    async function handleSubmit() {
        loading = true;

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            showToast(error.message, 'error');
            loading = false;
        } else if (paymentIntent.status === 'succeeded') {
            dispatch('success', { paymentIntentId: paymentIntent.id });
        }
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Enter Card Details</h3>
        
        <div class="py-4">
            <div id="card-element" class="p-3 border rounded-lg bg-base-200">
                </div>
        </div>

        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')} disabled={loading}>Cancel</button>
            <button class="btn btn-primary" on:click={handleSubmit} class:loading={loading}>
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    </div>
</div>
