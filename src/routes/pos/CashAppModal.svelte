<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js';
    import { showToast } from '../toastStore.js';

    export let publishableKey: string;
    export let clientSecret: string;
    export let returnUrl: string; // The URL to redirect to after mobile payment authorization
    export let totalAmount: number;

    const dispatch = createEventDispatcher();
    let stripe: any;
    let loading = true;
    let stripeElement: any;
    const QR_ELEMENT_ID = 'cashapp-qr-element';

    onMount(async () => {
        try {
            stripe = await loadStripe(publishableKey);
            const elements = stripe.elements({ clientSecret });

            // Creates the Cash App Pay UI (QR on desktop, button on mobile)
            stripeElement = elements.create('cashAppPay');
            stripeElement.mount(`#${QR_ELEMENT_ID}`);

            loading = false;
        } catch (e) {
            console.error("Failed to load Stripe or create element:", e);
            showToast("Failed to initialize payment interface.", "error");
            dispatch('close');
        }
    });

    async function handleConfirm() {
        if (!stripe || loading) return;
        loading = true;
        showToast('Redirecting to Cash App or awaiting scan...', 'info');

        // Confirming the payment intent starts the process. 
        // Stripe handles the UI and eventual redirection via the return_url.
        const { error, paymentIntent } = await stripe.confirmCashappPayment(clientSecret, {
            return_url: returnUrl,
        });

        if (error) {
            showToast(error.message, 'error');
            loading = false;
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // This case is unlikely to fire immediately as the customer is usually redirected.
            dispatch('success', { paymentIntentId: paymentIntent.id });
        }
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-sm">
        <h3 class="font-bold text-lg">Pay with Cash App</h3>
        
        <div class="py-4 text-center">
            <p class="mb-4">Scan the QR code below or tap to authorize the payment of **${totalAmount.toFixed(2)} USD**.</p>
            
            <div id="{QR_ELEMENT_ID}" class="w-full min-h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg p-4 bg-base-200">
                {#if loading}
                    <span class="loading loading-spinner loading-lg"></span>
                {:else}
                    {/if}
            </div>

            {#if !loading}
                <button 
                    class="btn btn-success btn-block mt-4" 
                    on:click={handleConfirm}
                    disabled={loading}
                    type="button"
                >
                    Confirm Payment / Scan QR
                </button>
                <p class="text-xs text-base-content/70 mt-2">
                    Payment status will update automatically after approval.
                </p>
            {/if}
        </div>

        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')} disabled={loading}>Cancel</button>
        </div>
    </div>
</div>
