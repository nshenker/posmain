<script lang='ts'>
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { storeName, merchantLogo } from '../stores.js';
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
</div>
