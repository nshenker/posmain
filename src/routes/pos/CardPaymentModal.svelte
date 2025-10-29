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
    let swipeInput = '';
    let lastKeypressTime = 0;

    onMount(async () => {
        stripe = await loadStripe(publishableKey);
        const elements = stripe.elements({ clientSecret });
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

    function parseTrackData(track) {
        // Simple parser for Track 1 data (most common for keyboard emulators)
        const track1Match = track.match(/%B(\d+)\^([^^]+)\^(\d{4})/);
        if (track1Match) {
            const [_, cardNumber, name, expiryYYMM] = track1Match;
            const expMonth = expiryYYMM.substring(2, 4);
            const expYear = expiryYYMM.substring(0, 2);
            return { cardNumber, name, expMonth, expYear };
        }
        // Fallback for simple Track 2 data
        const track2Match = track.match(/;(\d+)=(\d{4})/);
        if (track2Match) {
             const [_, cardNumber, expiryYYMM] = track2Match;
             const expMonth = expiryYYMM.substring(2, 4);
             const expYear = expiryYYMM.substring(0, 2);
             return { cardNumber, name: 'CARDHOLDER', expMonth, expYear };
        }
        return null;
    }

    async function handleSwipe() {
        loading = true;
        showToast('Card swipe detected. Processing...', 'info');
        
        const cardData = parseTrackData(swipeInput);
        swipeInput = ''; // Clear the input

        if (!cardData) {
            showToast('Could not parse card data. Please type manually.', 'error');
            loading = false;
            return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: {
                    number: cardData.cardNumber,
                    exp_month: cardData.expMonth,
                    exp_year: `20${cardData.expYear}`,
                },
                billing_details: {
                    name: cardData.name.trim(),
                },
            },
        });

        if (error) {
            showToast(error.message, 'error');
            loading = false;
        } else if (paymentIntent.status === 'succeeded') {
            dispatch('success', { paymentIntentId: paymentIntent.id });
        }
    }

    function handleKeydown(e) {
        const currentTime = Date.now();
        // If keys are pressed in rapid succession (typical for a swipe), buffer them.
        if (currentTime - lastKeypressTime < 50) {
            if (e.key === 'Enter') {
                if (swipeInput.length > 10) { // Basic validation
                    handleSwipe();
                }
            } else if (e.key.length === 1) { // Only buffer printable characters
                swipeInput += e.key;
            }
        } else {
            // If there's a pause, reset the buffer.
            swipeInput = e.key.length === 1 ? e.key : '';
        }
        lastKeypressTime = currentTime;
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Enter or Swipe Card</h3>
        
        <div class="py-4">
            <div class="alert alert-warning shadow-lg text-xs mb-4">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Card swiping is enabled. Please note: This method is for keyboard-emulating swipers and is not PCI compliant. For production use, we strongly recommend integrating Stripe Terminal.</span>
                </div>
            </div>
            <div id="card-element" class="p-3 border rounded-lg bg-base-200">
                </div>
        </div>

        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')} disabled={loading}>Cancel</button>
            <button class="btn btn-primary" on:click={handleSubmit} class:loading={loading}>
                {loading ? 'Processing...' : 'Pay Manually'}
            </button>
        </div>
    </div>
</div>
