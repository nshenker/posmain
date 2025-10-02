<script>
    import { onMount } from 'svelte';
    import { dashboardLayout, storeName } from '../stores.js';
    import KeyMetrics from './widgets/KeyMetrics.svelte';
    import RecentTransactions from './widgets/RecentTransactions.svelte';
    import SalesByToken from './widgets/SalesByToken.svelte';
    import SalesOverTime from './widgets/SalesOverTime.svelte';
    import LowStockAlerts from './widgets/LowStockAlerts.svelte';
    import PendingInvoices from './widgets/PendingInvoices.svelte';
    import TokenPriceCharts from './widgets/TokenPriceCharts.svelte';
    import { startTour as initTour } from '../../utils/tours.js';

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

    function startTour() {
        initTour();
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div id="dashboard-header" class="flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
        <h1 class="text-4xl font-greycliffbold text-center sm:text-left">Dashboard</h1>
        <div class="flex gap-2">
            <button class="btn btn-secondary" on:click={startTour}>Start Tour</button>
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

    <div id="dashboard-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {#each $dashboardLayout.widgets as widget}
            {#if widget.visible}
                <div class="card 
 bg-base-100 shadow-xl border">
                    <svelte:component this={widgetComponents[widget.id]} />
                </div>
            {/if}
        {/each}
    </div>
</div>
