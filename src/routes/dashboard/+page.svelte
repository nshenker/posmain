<script lang='ts'>
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { storeName, merchantLogo, publicKey } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const devWallet = 'CXfJMf3d8mm96RGtttztVcCwTGr1Dwnk6vypRAhZs6Yo';

    onMount(() => {
        if (browser && !$publicKey) {
            showToast("Please set your merchant wallet address first.", "error");
            goto('/');
        }
    });

    async function copyAddress() {
        if (browser) {
            try {
                await navigator.clipboard.writeText(devWallet);
                showToast('Address copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy address.', 'error');
            }
        }
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold text-charcoal">
            {$storeName} Merchant Suite
        </h1>
        {#if $merchantLogo}
            <img src={$merchantLogo} alt="Merchant Logo" class="h-24 mx-auto mt-4">
        {/if}
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Point of Sale</h2>
                <p>Create charges and accept payments in Solana.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/pos')} class="btn btn-primary">Go to POS</button>
                </div>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Invoicing</h2>
                <p>Manage your customer invoices.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/invoicing')} class="btn btn-primary">Manage Invoices</button>
                </div>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Inventory</h2>
                <p>Keep track of your product inventory.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/inventory')} class="btn btn-primary">Manage Inventory</button>
                </div>
            </div>
        </div>
    </div>

    <div class="text-center mt-12">
        <p class="text-sm text-gray-500">Enjoying PoSolana? Consider supporting the developer.</p>
        <div class="input-group mt-2 justify-center">
            <input type="text" value={devWallet} readonly class="input input-bordered w-full max-w-xs text-xs" />
            <button class="btn btn-square" on:click={copyAddress}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
        </div>
    </div>
</div>
