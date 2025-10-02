<script lang='ts'>
    import { onMount } from "svelte";
    import { storeName, publicKey, successArray } from './stores.js';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    let currentStep = 1;
    let name = '';
    let pk = '';
    let web3;

    onMount(async () => {
        // Dynamically import the web3 library only on the client-side
        const solanaWeb3 = await import('@solana/web3.js');
        web3 = solanaWeb3;

        name = $storeName || '';
        pk = $publicKey || '';
    });

    function validateAndProceed() {
        if (name.trim() === '') {
            alert('Please enter a store name.');
            return;
        }
        currentStep = 2;
    }

    function save() {
        if (pk.trim() === '') {
            alert('Please enter a wallet address.');
            return;
        }

        if (!web3) {
            alert('Page is still loading, please wait a moment.');
            return;
        }

        try {
            // Basic validation for a Solana public key
            new web3.PublicKey(pk.trim());
            storeName.set(name);
            publicKey.set(pk.trim());
            // Only initialize the transaction array if it's the very first setup
            if (!$successArray) {
                successArray.set([]);
            }
            goto('/dashboard');
        } catch (e) {
            alert('Invalid Solana wallet address. Please check and try again.');
        }
    }
</script>

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content text-center">
        <div class="max-w-md">
            <h1 class="text-5xl font-bold text-primary">Welcome to PoSolana</h1>
            <p class="py-6">The decentralized Point of Sale suite for modern businesses on the Solana network.</p>
            
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    {#if currentStep === 1}
                        <h2 class="card-title">Let's set up your store</h2>
                        <p>First, what's the name of your business?</p>
                        <div class="form-control">
                            <input type="text" placeholder="e.g., Solana Coffee" class="input input-bordered" bind:value={name} />
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-primary" on:click={validateAndProceed}>Next</button>
                        </div>
                    {:else if currentStep === 2}
                        <h2 class="card-title">Set your destination wallet</h2>
                        <p>Enter the Solana wallet address where you'd like to receive payments. This can be changed later in the settings.</p>
                        <div class="form-control">
                            <input type="text" placeholder="Your Solana wallet address" class="input input-bordered" bind:value={pk} />
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-ghost" on:click={() => currentStep = 1}>Back</button>
                            <button class="btn btn-primary" on:click={save}>Enter Suite</button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
