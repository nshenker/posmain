<script>
    import { onMount, onDestroy } from 'svelte';
    import { dashboardLayout, storeName } from '../stores.js';
    import KeyMetrics from './widgets/KeyMetrics.svelte';
    import RecentTransactions from './widgets/RecentTransactions.svelte';
    import SalesByToken from './widgets/SalesByToken.svelte';
    import SalesOverTime from './widgets/SalesOverTime.svelte';
    import LowStockAlerts from './widgets/LowStockAlerts.svelte';
    import PendingInvoices from './widgets/PendingInvoices.svelte';
    import TokenPriceCharts from './widgets/TokenPriceCharts.svelte';
    import WidgetEditor from './WidgetEditor.svelte';
    import { browser } from '$app/environment';

    const widgetComponents = {
        keyMetrics: KeyMetrics,
        recentTransactions: RecentTransactions,
        salesByToken: SalesByToken,
        salesOverTime: SalesOverTime,
        lowStockAlerts: LowStockAlerts,
        pendingInvoices: PendingInvoices,
        tokenPriceCharts: TokenPriceCharts,
    };
    let isEditing = false;
    let ready = false; // Flag for component mount
    let layoutLoaded = false;
    // Flag for layout data presence
    let unsubscribeLayout;
    // To hold the unsubscribe function

    onMount(() => {
        // This code runs only in the browser after the component mounts
        ready = true;

        // Subscribe to the store to explicitly wait for its value
        unsubscribeLayout = dashboardLayout.subscribe(value => {
            if (browser && value && value.widgets && value.widgets.length > 0) {
        
                // Once we get a valid layout value from the store, set the flag
                layoutLoaded = true;
            } else if (browser 
                && value && (!value.widgets || value.widgets.length === 0)) {
                // Handle case where layout exists but has no widgets (maybe after a reset?)
                // Still mark as loaded so it doesn't hang indefinitely
                layoutLoaded = true;
            }
        });
    });
    // Unsubscribe when the component is destroyed
    onDestroy(() => {
        if (unsubscribeLayout) {
            unsubscribeLayout();
        }
    });
</script>

{#if isEditing}
    <WidgetEditor on:close={() => isEditing = false} />
{/if}

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div id="dashboard-header" class="flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
        <h1 class="text-4xl font-greycliffbold text-center sm:text-left">Dashboard</h1>
        <div class="flex gap-2">
            <button class="btn btn-primary" on:click={() => isEditing = !isEditing}>
               
                {isEditing ? 'Done' : 'Edit Widgets'}
            </button>
        </div>
    </div>

    <div id="dashboard-nav-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Point of Sale</h2>
        
                <p>Create charges and accept payments in Solana.</p>
                <div class="card-actions justify-center mt-4">
                    <a href="/pos" id="tour-pos-link" class="btn btn-primary">Go to POS</a>
                </div>
            </div>
        </div>

     
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Invoicing</h2>
                <p>Manage your customer invoices.</p>
                <div class="card-actions justify-center mt-4">
                  
                    <a href="/invoicing" id="tour-invoicing-link" class="btn btn-primary">Manage Invoices</a>
                </div>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Inventory</h2>
        
                <p>Keep track of your product inventory.</p>
                <div class="card-actions justify-center mt-4">
                    <a href="/inventory" id="tour-inventory-link" class="btn btn-primary">Manage Inventory</a>
                </div>
            </div>
        </div>

       
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">CRM</h2>
                <p>Manage your customer relationships.</p>
                <div class="card-actions justify-center mt-4">
                    
                    <a href="/crm" id="tour-crm-link" class="btn btn-primary">Go to CRM</a>
                </div>
            </div>
        </div>
    </div>

    {#if ready && layoutLoaded}
        <div id="dashboard-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
           
            {#if $dashboardLayout && $dashboardLayout.widgets} {#each $dashboardLayout.widgets as widget (widget.id)} {#if widget.visible}
                        <div class="card bg-base-100 shadow-xl border">
                  
           {#if widgetComponents[widget.id]}
                                <svelte:component this={widgetComponents[widget.id]} />
                    
                    {:else}
                                <div class="card-body"><p>Error: Widget component '{widget.id}' not found.</p></div>
                            {/if}
                        </div>
  
                   {/if}
                {/each}
            {:else}
                 <div class="text-center p-8 mt-8 md:col-span-2 lg:col-span-3">
                     <p class="text-error">Error: Could not properly load dashboard layout data.</p>
   
               </div>
            {/if}
        </div>
    {:else if ready && !layoutLoaded}
        <div class="text-center p-8 mt-8">
            <span class="loading loading-spinner loading-lg"></span>
            <p>Loading Dashboard Widgets...</p>
    
         </div>
    {/if}
</div>
