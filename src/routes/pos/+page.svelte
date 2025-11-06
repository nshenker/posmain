<script lang='ts'>
    import { onMount } from "svelte";
    import { storeName, merchantLogo, publicKey, currentUser } from '../stores.js';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import CreateCharge from "./CreateCharge.svelte";
    // Removed: import Settings from "./Settings.svelte";
    // Removed: import Transactions from "./Transactions.svelte";

    onMount(() => {
        if (browser && !$publicKey) {
            // alert("Please set your merchant wallet address first."); // Use toast instead
            goto('/');
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

    <div class="mt-4 flex-grow flex justify-center">
        <div class="w-full flex justify-center">
             <CreateCharge/>
        </div>
    </div>
</div>
