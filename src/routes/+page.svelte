<script lang='ts'>
    import { onMount } from "svelte";
    import * as web3 from '@solana/web3.js';
	import { storeName, publicKey } from './stores.js';
    import { goto } from '$app/navigation';

    let cnx;
    let invalidKey = false;
	onMount(async () => {
        
        let sol_rpc = process.env.SOLANA_RPC? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/5Bo-yRwJYXcscWQkkah0KJ-9jPmm5cSi";
        cnx = new web3.Connection(sol_rpc);
        
    })

    async function createStore() {
        try {
            $publicKey = $publicKey.trim()
            new web3.PublicKey($publicKey);
			invalidKey = false;
			goto('/dashboard');
		}
         catch(e) {
            invalidKey = true;
		}
        
    }

</script>

<div class="flex flex-col min-h-screen">
    <main class="flex-grow flex flex-col items-center justify-center p-4">
    
        <div class="text-center mb-8">
            <h1 class="font-greycliffbold text-5xl text-charcoal tracking-tight">
                Solana Merchant Suite
            </h1>
            <p class="font-greycliffmed text-lg text-gray-500 mt-2">Your all-in-one solution for running your business on Solana.</p>
        </div>

        <div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
            
            <div class="card-body p-8">
                <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Enter Merchant Details</h2>
                
        
                <div class="form-control w-full">
                    <label for="store-name" class="label">
                      <span class="label-text font-greycliffmed">Store Name</span>
                    </label>
                    <input id="store-name" bind:value={$storeName} type="text" placeholder="e.g., The Gilded Lily" class="input input-bordered w-full" /> 
                </div>

                <div class="form-control w-full mt-4">
                    <label for="wallet-address" class="label">
                      <span class="label-text font-greycliffmed">Merchant Wallet Address</span>
        
                    </label>
                    <input id="wallet-address" bind:value={$publicKey} type="text" placeholder="Solana Public Key" class="input input-bordered w-full" />    
                </div>
                
                {#if invalidKey}
                     <span class="text-center text-sm text-error mt-2">Invalid key - please enter a valid wallet address</span>
                {/if}

                <div class="card-actions justify-center mt-6">
                    <button on:click={createStore} class="btn btn-primary btn-wide text-white font-greycliffbold normal-case">Enter Suite</button>
                </div>
        
                <div class="text-xs text-center font-greycliffmed text-gray-400 mt-6">Powered by
                    <span class="font-bold">Shanksy Productions</span>
                </div>
            </div>
        </div>
    </main>

  
    <footer class="footer footer-center p-4 text-base-content">
        <div class="items-center">
            <span class="text-sm text-gray-400">Shanksy © 2025</span>
        </div>
    </footer>
</div>
