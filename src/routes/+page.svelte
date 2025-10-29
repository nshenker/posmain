<script lang='ts'>
    import { onMount } from "svelte";
    import { storeName, publicKey, successArray, employees, currentUser } from './stores.js';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    let currentStep = 1;
    let name = '';
    let pk = '';
    let adminPin = '';
    let web3;

    onMount(async () => {
        // If setup has been completed previously, redirect to the main app.
        // The layout will handle showing the login screen if needed.
        if ($publicKey) {
            goto('/pos');
            return;
        }

        // Dynamically import the web3 library only on the client-side
        const solanaWeb3 = await import('@solana/web3.js');
        web3 = solanaWeb3;

        name = $storeName || '';
        pk = $publicKey || '';
    });

    function validateNameAndProceed() {
        if (name.trim() === '') {
            alert('Please enter a store name.');
            return;
        }
        currentStep = 2;
    }

    function validateWalletAndProceed() {
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
            currentStep = 3; // Move to the PIN step
        } catch (e) {
            alert('Invalid Solana wallet address. Please check and try again.');
        }
    }

    function save() {
        if (adminPin.trim().length < 4) {
            alert('Your Admin PIN must be at least 4 digits.');
            return;
        }

        // Save store name and public key
        storeName.set(name.trim());
        publicKey.set(pk.trim());
        
        // Create the admin user with the chosen PIN and default status
        const adminUser = { id: 'admin', name: 'Admin', pin: adminPin.trim(), role: 'manager', status: 'Clocked Out' };
        employees.set([adminUser]);
        
        // Log the new admin user in immediately
        currentUser.set(adminUser);
        
        // Only initialize the transaction array if it's the very first setup
        if (!$successArray) {
            successArray.set([]);
        }
        goto('/dashboard');
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
                            <button class="btn btn-primary" on:click={validateNameAndProceed}>Next</button>
                        </div>
                    {:else if currentStep === 2}
                        <h2 class="card-title">Set your destination wallet</h2>
                        <p>Enter the Solana wallet address where you'd like to receive payments. This can be changed later in the settings.</p>
                        <div class="form-control">
                            <input type="text" placeholder="Your Solana wallet address" class="input input-bordered" bind:value={pk} />
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-ghost" on:click={() => currentStep = 1}>Back</button>
                            <button class="btn btn-primary" on:click={validateWalletAndProceed}>Next</button>
                        </div>
                    {:else if currentStep === 3}
                        <h2 class="card-title">Set Your Admin PIN</h2>
                        <p>This PIN will be used to access management features like settings and analytics. Make it secure!</p>
                        <div class="form-control">
                            <input type="password" placeholder="Enter at least 4 digits" class="input input-bordered" bind:value={adminPin} />
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-ghost" on:click={() => currentStep = 2}>Back</button>
                            <button class="btn btn-primary" on:click={save}>Enter Suite</button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
