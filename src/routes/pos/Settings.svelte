<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
    import { 
        storeName, publicKey, pmtAmt, showWarning, mints, selectedMint, 
        merchantLogo, successArray, mostRecentTxn, fullScreen, theme, 
        invoices, inventory, categories, inventoryHistory, currentChargeItems,
        dashboardLayout, customers, customerGroups, lastBackupDate
    } from '../stores.js';
    import { get } from 'svelte/store';
    import { showToast } from '../toastStore.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';

    let showResetConfirmation = false;
    async function reset() {
        showResetConfirmation = false;
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
        categories.set(["Default"]);
        inventoryHistory.set({});
        currentChargeItems.set([]);
        customers.set([]);
        customerGroups.set([]);
        lastBackupDate.set(null);
        // A default layout structure is needed here to avoid errors on reset
        dashboardLayout.set({ widgets: [ { id: 'keyMetrics', name: 'Key Metrics', visible: true } ] });
        goto('/', { replace: true });
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

    function removeLogo() {
        $merchantLogo = "";
        showToast('Logo removed.', 'success');
    }

    function exportData() {
        const backupData = {
            storeName: get(storeName),
            publicKey: get(publicKey),
            pmtAmt: get(pmtAmt),
            mostRecentTxn: get(mostRecentTxn),
            showWarning: get(showWarning),
            fullScreen: get(fullScreen),
            successArray: get(successArray),
            selectedMint: get(selectedMint),
            merchantLogo: get(merchantLogo),
            theme: get(theme),
            invoices: get(invoices),
            inventory: get(inventory),
		    categories: get(categories),
            inventoryHistory: get(inventoryHistory),
            dashboardLayout: get(dashboardLayout),
            customers: get(customers),
            customerGroups: get(customerGroups)
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `posolana-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        lastBackupDate.set(new Date().toISOString());
        showToast('Data exported successfully!', 'success');
    }

    function handleDataImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result as string);
                    storeName.set(importedData.storeName || "");
                    publicKey.set(importedData.publicKey || "");
                    pmtAmt.set(importedData.pmtAmt || "");
                    mostRecentTxn.set(importedData.mostRecentTxn || "");
                    showWarning.set(importedData.showWarning !== undefined ? importedData.showWarning : true);
                    fullScreen.set(importedData.fullScreen || false);
                    successArray.set(importedData.successArray || []);
                    selectedMint.set(importedData.selectedMint || "USDC");
                    merchantLogo.set(importedData.merchantLogo || "");
                    theme.set(importedData.theme || "light");
                    invoices.set(importedData.invoices || []);
                    inventory.set(importedData.inventory || []);
                    categories.set(importedData.categories || ["Default"]);
                    inventoryHistory.set(importedData.inventoryHistory || {});
                    dashboardLayout.set(importedData.dashboardLayout || { widgets: [] });
                    customers.set(importedData.customers || []);
                    customerGroups.set(importedData.customerGroups || []);
					showToast('Data imported successfully! The page will now reload.', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
                    console.error("Failed to parse imported file:", error);
                    showToast('Invalid backup file. Please try again.', 'error');
                }
            };
            reader.readAsText(file);
        }
    }
</script>

{#if showResetConfirmation}
    <ConfirmationModal
        message="Are you sure you want to reset your store? This will clear all settings, transaction history, invoices, and inventory permanently."
        on:confirm={reset}
        on:cancel={() => showResetConfirmation = false}
    />
{/if}

<div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Settings</h2>

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
            {#if $merchantLogo}
                <button on:click={removeLogo} class="btn btn-xs btn-error mt-2">Remove Logo</button>
            {/if}
        </div>
        
        <div class="divider"></div>

        <h2 class="card-title text-xl font-greycliffmed mb-4">Data Management</h2>

        <div class="form-control w-full mt-4">
            <label for="export-data" class="label">
                <span class="label-text 
                font-greycliffmed">Export Data</span>
	    </label>
            <button id="export-data" on:click={exportData} class="btn btn-outline normal-case">Download Backup</button>
            {#if $lastBackupDate}
                <p class="text-xs text-center mt-2">Last backup: {new Date($lastBackupDate).toLocaleString()}</p>
            {/if}
        </div>

        <div class="form-control w-full mt-4">
            <label for="import-data" class="label">
                <span class="label-text font-greycliffmed">Import Data</span>
            </label>
    
            <input id="import-data" type="file" 
            on:change={handleDataImport} accept=".json" class="file-input file-input-bordered w-full" />
        </div>

        <div class="divider"></div>

        <div class="card-actions justify-center mt-6">
            <button on:click={() => showResetConfirmation = true} class="btn btn-outline btn-error normal-case">Reset Store</button>
   </div>
    </div>
</div>
