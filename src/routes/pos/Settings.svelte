<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
    import {
        storeName, publicKey, pmtAmt, showWarning, mints, selectedMint,
        merchantLogo, businessAddress, successArray, mostRecentTxn, fullScreen, theme,
        invoices, inventory, categories, inventoryHistory, currentChargeItems,
        dashboardLayout, customers, customerGroups, lastBackupDate,
        taxRate, defaultTaxable, stripePublishableKey, stripeSecretKey, chargeCardFee,
        locations, employees, timeClockEvents, loyaltyRedemptionRate, savedCarts // MODIFIED: Added savedCarts
    } from '../stores.js';
    import { get } from 'svelte/store';
    import { showToast } from '../toastStore.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';
    import ManageEmployees from './ManageEmployees.svelte';
    import LoyaltySettingsModal from './LoyaltySettingsModal.svelte';

    let activeTab = 'store';
    let showResetConfirmation = false;
    let showLoyaltyModal = false;
    // New state for modal

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
        businessAddress.set("");
        taxRate.set(8.875);
        defaultTaxable.set(true);
        stripePublishableKey.set("");
        stripeSecretKey.set("");
        chargeCardFee.set(false);
        theme.set("light");
        invoices.set([]);
        inventory.set([]);
        categories.set(["Default"]);
        locations.set([]);
        inventoryHistory.set({});
        currentChargeItems.set([]);
        customers.set([]);
        // Reset customers
        customerGroups.set([]);
        lastBackupDate.set(null);
        employees.set([]);
        timeClockEvents.set([]);
        loyaltyRedemptionRate.set({ points: 100, discount: 10 });
        // Reset new store
        savedCarts.set([]); // ADDED: Reset savedCarts
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
            businessAddress: get(businessAddress),
            taxRate: get(taxRate),
            defaultTaxable: get(defaultTaxable),
            stripePublishableKey: get(stripePublishableKey),
         
            stripeSecretKey: get(stripeSecretKey),
            chargeCardFee: get(chargeCardFee),
            theme: get(theme),
            invoices: get(invoices),
            // Ensure array items are correctly copied.
            inventory: get(inventory),
		    categories: get(categories),
            locations: get(locations), // MODIFIED: Added locations
            inventoryHistory: get(inventoryHistory),
            dashboardLayout: get(dashboardLayout),
  
            customers: get(customers), // Include customers with loyalty points
            customerGroups: get(customerGroups),
            // Employees array now includes hourlyRate
    
            employees: get(employees),
            timeClockEvents: get(timeClockEvents),
            // ADDED: Loyalty Redemption Rate
            loyaltyRedemptionRate: get(loyaltyRedemptionRate),
            savedCarts: get(savedCarts) // MODIFIED: Added savedCarts
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
                    businessAddress.set(importedData.businessAddress || "");
                    taxRate.set(importedData.taxRate || 8.875);
                    defaultTaxable.set(importedData.defaultTaxable !== undefined ? importedData.defaultTaxable : true);
                    stripePublishableKey.set(importedData.stripePublishableKey || "");
                    stripeSecretKey.set(importedData.stripeSecretKey || "");
                    chargeCardFee.set(importedData.chargeCardFee || false);
                    theme.set(importedData.theme || "light");
                    invoices.set(importedData.invoices || []);
                    
                    // Inventory: Ensure new 'imageURL' is handled, default to empty string if missing
                    inventory.set((importedData.inventory || []).map(i => ({...i, imageURL: i.imageURL || ''})));
                    categories.set(importedData.categories || ["Default"]);
                    locations.set(importedData.locations || []); // MODIFIED: Added locations import
                    inventoryHistory.set(importedData.inventoryHistory || {});
                    dashboardLayout.set(importedData.dashboardLayout || { widgets: [] });
                    // Customers: Ensure loyalty points exist
                    customers.set((importedData.customers || []).map(c => ({...c, loyaltyPoints: c.loyaltyPoints || 0})));
                    customerGroups.set(importedData.customerGroups || []);
                    
                    // Employees: Ensure new 'hourlyRate' is handled, default to 0 if missing
                    employees.set((importedData.employees || []).map(e => ({...e, hourlyRate: e.hourlyRate || 0})));
                    timeClockEvents.set(importedData.timeClockEvents || []);
                    // ADDED: Loyalty Redemption Rate
                    loyaltyRedemptionRate.set(importedData.loyaltyRedemptionRate || { points: 100, discount: 10 });
                    
                    savedCarts.set(importedData.savedCarts || []); // MODIFIED: Added savedCarts import

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
        message="Are you sure you want to reset your store? This will clear all settings, transaction history, invoices, inventory, and customer data permanently."
        on:confirm={reset}
        on:cancel={() => showResetConfirmation = false}
    />
{/if}

{#if showLoyaltyModal}
    <LoyaltySettingsModal on:close={() => showLoyaltyModal = false} />
{/if}

<div class="card w-full max-w-lg bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-4 sm:p-8">
        <div id="settings-tabs" role="tablist" class="tabs tabs-bordered justify-center flex-shrink-0 mb-4">
            <button role="tab" class="tab" on:click={() => (activeTab = 'store')} class:tab-active={activeTab === 'store'}>Store</button>
            <button role="tab" class="tab" on:click={() => (activeTab = 'employees')} class:tab-active={activeTab === 'employees'}>Employees</button>
        </div>

   
        <div class:hidden={activeTab !== 'store'}>
            <h2 class="card-title text-xl font-greycliffmed mb-4">Store Settings</h2>

            <div id="tour-settings-general">
                <div class="form-control">
                    <label class="label cursor-pointer">
         
                        <span class="label-text font-greycliffmed">Show 'No Custody' Warning</span>
                        <input type="checkbox" bind:checked={$showWarning} class="toggle toggle-primary" />
                    </label>
        
                </div>

                <div class="form-control w-full mt-4">
          
                    <label for="currency-select" class="label">
                        <span class="label-text font-greycliffmed">Default Crypto Currency</span>
             
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

   
                <div class="form-control w-full mt-4">
                    <label for="address-input" class="label">
                        <span class="label-text font-greycliffmed">Business Address</span>
                    </label>

               
                <textarea id="address-input" bind:value={$businessAddress} class="textarea textarea-bordered" placeholder="123 Main St&#10;Anytown, USA 12345"></textarea>
                </div>
            </div>

            <div class="divider"></div>

            <div id="tour-settings-tax">
                <h2 class="card-title text-xl font-greycliffmed mb-4">Tax Settings</h2>
           
 
                <div class="form-control w-full">

<label for="tax-rate-input" class="label">
                        <span class="label-text font-greycliffmed">Sales Tax Rate (%)</span>
                    </label>
                    <input id="tax-rate-input" type="number" step="0.001" bind:value={$taxRate} class="input input-bordered" />
     
                </div>
                <div class="form-control mt-2">
                    <label class="label cursor-pointer">
                        <span class="label-text font-greycliffmed">Apply Tax by Default</span>
     
                        <input type="checkbox" bind:checked={$defaultTaxable} class="toggle toggle-primary" />
 
                    </label>
                </div>
            </div>


            <div class="divider"></div>

            <div id="tour-settings-stripe">
 
                <h2 class="card-title text-xl font-greycliffmed mb-4">Stripe Payments</h2>
      
                <div class="form-control w-full">
                    <label for="stripe-pk" class="label">
                        <span class="label-text font-greycliffmed">Stripe Publishable Key</span>
      
                    </label>
                  
                    <input id="stripe-pk" type="text" placeholder="pk_test_..." bind:value={$stripePublishableKey} class="input input-bordered" />
                </div>
                <div class="form-control w-full mt-2">
      
                    <label for="stripe-sk" class="label">
                        <span class="label-text font-greycliffmed">Stripe Secret Key</span>
      
                    </label>
                    <input id="stripe-sk" type="password" placeholder="sk_test_..." bind:value={$stripeSecretKey} class="input input-bordered" />
   
                </div>
                <div class="form-control mt-2">
                    <label class="label cursor-pointer">
   
                        <span class="label-text font-greycliffmed">Charge 3% Credit Card Fee</span>
              
                        <input type="checkbox" bind:checked={$chargeCardFee} class="toggle toggle-primary" />
                    </label>
                </div>
        
            </div>

            <div class="divider"></div>

             <div>
   
                <h2 class="card-title text-xl font-greycliffmed mb-4">Loyalty Program</h2>
                <p class="text-sm text-base-content/70">Loyalty points are automatically awarded at a rate of 1 point 
 per $1 spent (USD equivalent for crypto).
                Points are tracked per customer.</p>
                <div class="card-actions justify-center mt-4">
                    <button class="btn btn-outline" on:click={() => showLoyaltyModal = true}>Set Redemption Rate</button>
                </div>
            </div>

            <div class="divider"></div>

       
            <div id="tour-settings-data">
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
                         on:change={handleDataImport} 
                        accept=".json" class="file-input file-input-bordered w-full" />
                </div>
            </div>

            <div class="divider"></div>

            <div class="card-actions justify-center mt-6">
     
                <button on:click={() => showResetConfirmation = true} class="btn btn-outline btn-error normal-case">Reset Store</button>
       </div>
  
       </div>

        <div class:hidden={activeTab !== 'employees'}>
            <ManageEmployees />
        </div>
    </div>
</div>
