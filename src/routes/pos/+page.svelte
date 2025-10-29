<script lang='ts'>
    import { onMount } from "svelte";
    import { storeName, merchantLogo, publicKey, currentUser } from '../stores.js';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import CreateCharge from "./CreateCharge.svelte";
    import Settings from "./Settings.svelte";
    import Transactions from "./Transactions.svelte";

    let activeTab = 'charge';
    let showTransactionsModal = false; // Add state for modal visibility

    onMount(() => {
        if (browser && !$publicKey) {
            // alert("Please set your merchant wallet address first."); // Use toast instead
            goto('/');
        }
    });

    // Function to handle opening the transactions modal
    function openTransactionsModal() {
        activeTab = 'transactions'; // Keep track of the conceptual tab
        showTransactionsModal = true;
    }

    // Function to handle closing the transactions modal
    function closeTransactionsModal() {
        showTransactionsModal = false;
        // Optionally reset activeTab if needed, though CreateCharge is the default view
        activeTab = 'charge';
    }

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

    <div id="pos-tabs" role="tablist" class="tabs tabs-bordered justify-center flex-shrink-0">
        <button role="tab" class="tab tab-lg" on:click={() => (activeTab = 'charge')} class:tab-active={activeTab === 'charge'}>Charge</button>
        <button role="tab" class="tab tab-lg" on:click={openTransactionsModal} class:tab-active={activeTab === 'transactions'}>Transactions</button> <!-- Changed to open modal -->
        {#if $currentUser && $currentUser.role === 'manager'}
            <button role="tab" class="tab tab-lg" on:click={() => (activeTab = 'settings')} class:tab-active={activeTab === 'settings'}>Settings</button>
        {/if}
    </div>

    <div class="mt-4 flex-grow flex justify-center">
        <!-- Always render CreateCharge unless Settings is active -->
        <div class:hidden={activeTab === 'settings' || showTransactionsModal} class="w-full flex justify-center">
             <CreateCharge/>
        </div>

        <!-- Render Settings conditionally -->
        {#if activeTab === 'settings'}
            <div id="settings-view" class="w-full flex justify-center">
                <Settings/>
            </div>
        {/if}
    </div>
</div>

<!-- Render Transactions Modal Conditionally -->
{#if showTransactionsModal}
    <Transactions on:close={closeTransactionsModal} />
{/if}


