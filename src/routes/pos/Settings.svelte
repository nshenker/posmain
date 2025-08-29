<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
	import { storeName, publicKey, pmtAmt, showWarning, mints, selectedMint, merchantLogo, successArray, mostRecentTxn, fullScreen, theme, invoices, inventory } from '../stores.js';
	
    async function reset() {
        if (typeof window !== 'undefined' && confirm("Are you sure you want to reset your store? This will clear all settings, transaction history, invoices, and inventory permanently.")) {
            localStorage.clear();
			// Reset all stores to their default values
            storeName.set("");
			publicKey.set("");
            pmtAmt.set("");
            mostRecentTxn.set("");
            showWarning.set(true);
            fullScreen.set(false);
            successArray.set([]);
            selectedMint.set("USDC");
            merchantLogo.set("");
            theme.set("light");
            invoices.set([]);
            inventory.set([]);
            goto('/', { state: { foo: 'bar' } });
		}
    }

    function handleLogoUpload(event) {
        const file = event.target.files[0];
		if (file) {
            const reader = new FileReader();
			reader.onload = (e) => {
                $merchantLogo = e.target.result;
			};
            reader.readAsDataURL(file);
        }
    }
</script>

<div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8">
        <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Settings</h2>

        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text font-greycliffmed">Show 'No Custody' Warning</span>
                <input type="checkbox" bind:checked={$showWarning} class="toggle toggle-primary" />
	         </label>
        </div>

        <div class="form-control w-full mt-4">
            <label for="currency-select" class="label">
                <span class="label-text font-greycliffmed">Default Currency</span>
            </label>
            <select id="currency-select" bind:value={$selectedMint} class="select select-bordered">
			     {#each $mints as mint}
                   <option>{mint.name}</option>
                {/each}
            </select>
        </div>

        <div class="form-control w-full mt-4">
            <label for="logo-upload" class="label">
			   <span class="label-text font-greycliffmed">Brand Logo</span>
            </label>
            <input id="logo-upload" type="file" on:change={handleLogoUpload} class="file-input file-input-bordered w-full" />
        </div>

        <div class="card-actions justify-center mt-6">
            <button on:click={reset} class="btn btn-outline btn-error normal-case">Reset Store</button>
        </div>
    </div>
</div>
