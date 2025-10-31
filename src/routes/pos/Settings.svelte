<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
import {
        storeName, publicKey, pmtAmt, showWarning, mints, selectedMint,
        merchantLogo, businessAddress, successArray, mostRecentTxn, fullScreen, theme,
        invoices, inventory, categories, inventoryHistory, currentChargeItems,
        dashboardLayout, customers, customerGroups, lastBackupDate,
        taxRate, defaultTaxable, stripePublishableKey, stripeSecretKey, chargeCardFee,
        locations, employees, timeClockEvents, loyaltyRedemptionRate, savedCarts, coupons, cartDiscount // MODIFIED: Added coupons, cartDiscount
    } from '../stores.js';
import { get } from 'svelte/store';
    import { showToast } from '../toastStore.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';
    import ManageEmployees from './ManageEmployees.svelte';
import LoyaltySettingsModal from './LoyaltySettingsModal.svelte';
    import ManageCoupons from './ManageCoupons.svelte'; // MODIFIED: Added ManageCoupons import

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
        savedCarts.set([]);
// ADDED: Reset savedCarts
        coupons.set([]); // MODIFIED: Added coupons reset
        cartDiscount.set(null); // MODIFIED: Added cartDiscount reset
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
            locations: get(locations), // EXPORTED: Inventory locations
            inventoryHistory: get(inventoryHistory),
            dashboardLayout: get(dashboardLayout),
  
            customers: get(customers), // EXPORTED: Customer data (including loyalty points)
            customerGroups: get(customerGroups),
            // Employees array now includes 
            // hourlyRate 
            employees: get(employees), // EXPORTED: Employee data
            timeClockEvents: get(timeClockEvents), // EXPORTED: Time clock logs
            // ADDED: Loyalty Redemption Rate
            loyaltyRedemptionRate: get(loyaltyRedemptionRate), // EXPORTED: Loyalty settings
            savedCarts: get(savedCarts), // EXPORTED: Saved carts
            coupons: get(coupons), // EXPORTED: Coupons data
            // NOTE: currentChargeItems, cartDiscount, barcodeScanned are excluded as they are runtime states.
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
                    locations.set(importedData.locations || []); // IMPORTED: Inventory locations
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
savedCarts.set(importedData.savedCarts || []); // IMPORTED: Saved carts
                    coupons.set(importedData.coupons || []); // IMPORTED: Coupons data
                    
                    // Reset runtime states
                    currentChargeItems.set([]); 
                    cartDiscount.set(null); 
                    
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
// ... (rest of the file is unchanged)
