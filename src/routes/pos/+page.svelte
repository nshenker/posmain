<script lang='ts'>
    import { onMount } from "svelte";
    import { storeName, merchantLogo, publicKey } from '../stores.js';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    // Removed static import: import CreateCharge from "./CreateCharge.svelte";
    import Settings from "./Settings.svelte";
    import Transactions from "./Transactions.svelte";
	
    let activeTab = 'charge';
    let CreateCharge = null; // Prepare for dynamic import

    onMount(async () => {
        if (browser) {
            if (!$publicKey) {
                alert("Please set your merchant wallet address first.");
                goto('/');
            }
            // Dynamically import the component only on the client-side
            CreateCharge = (await import('./CreateCharge.svelte')).default;
        }
    });
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col" style="height: calc(100vh - 6rem);">
    <header class="text-center py-4 md:py-6 flex-shrink-0">
        <h1 class="text-3xl md:text-4xl font-greycliffbold">
            {$storeName}
        </h1>
        {#if $merchantLogo}
            <img src={$merchantLogo} alt="Merchant Logo" class="h-16 md:h-24 mx-auto mt-2">
        {/if}
    </header>
    
    <div role="tablist" class="tabs tabs-bordered justify-center flex-shrink-0">
        <button role="tab" class="tab tab-lg" on:click={() => (activeTab = 'charge')} class:tab-active={activeTab === 'charge'}>Charge</button>
        <button role="tab" class="tab tab-lg" on:click={() => (activeTab = 'transactions')} class:tab-active={activeTab === 'transactions'}>Transactions</button>
        <button role="tab" class="tab tab-lg" on:click={() => (activeTab = 'settings')} class:tab-active={activeTab === 'settings'}>Settings</button>
    </div>

    <div class="mt-4 flex-grow flex justify-center">
        <div class:hidden={activeTab !== 'charge'} class="w-full flex justify-center">
            {#if CreateCharge}
                <svelte:component this={CreateCharge} />
            {:else}
                <div class="flex items-center justify-center">
                    <p>Loading...</p>
                </div>
            {/if}
        </div>
        <div class:hidden={activeTab !== 'transactions'} class="w-full flex justify-center">
            <Transactions/>
        </div>
        <div class:hidden={activeTab !== 'settings'} class="w-full flex justify-center">
            <Settings/>
        </div>
    </div>
</div>
