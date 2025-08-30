<script lang='ts'>
    import { onMount } from "svelte";
    import { storeName, merchantLogo, publicKey } from '../stores.js';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import CreateCharge from "./CreateCharge.svelte";
    import Settings from "./Settings.svelte";
    import Transactions from "./Transactions.svelte";
	
    let activeTab = 1;

    onMount(() => {
        if (browser && !$publicKey) {
            alert("Please set your merchant wallet address first.");
            goto('/');
        }
    });
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">
            {$storeName}
        </h1>
        {#if $merchantLogo}
            <img src={$merchantLogo} alt="Merchant Logo" class="h-24 mx-auto mt-4">
        {/if}
    </header>
    <div class="btm-nav md:hidden">
        <button class:active={activeTab === 1} on:click={() => (activeTab = 1)}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            <span class="btm-nav-label">Charge</span>
        </button>
        <button class:active={activeTab === 2} on:click={() => (activeTab = 2)}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span class="btm-nav-label">History</span>
        </button>
        <button class:active={activeTab === 3} on:click={() => (activeTab = 3)}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span class="btm-nav-label">Settings</span>
        </button>
    </div>
    <div role="tablist" class="tabs tabs-bordered justify-center hidden md:flex">
        <button role="tab" class="tab tab-lg" on:click={()=>(activeTab=1)} class:tab-active={activeTab === 1}>Create Charge</button>
        <button role="tab" class="tab tab-lg" on:click={()=>(activeTab=2)} class:tab-active={activeTab === 2}>Transactions</button>
        <button role="tab" class="tab tab-lg" on:click={()=>(activeTab=3)} class:tab-active={activeTab === 3}>Settings</button>
    </div>
    <div class="mt-4 flex justify-center">
        {#if activeTab == 1}
            <CreateCharge/>
        {:else if activeTab == 2}
            <Transactions/>
        {:else if activeTab == 3}
            <Settings/>
        {/if}
    </div>
</div>
