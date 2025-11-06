<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { storeName, successArray, invoices, customers } from '../stores.js';
    import { tokenPrices } from '../priceStore.js';
    import { browser } from '$app/environment';
    import dayjs from 'dayjs';
    
    // --- Chart Imports (Self-sufficient or using 'sales' prop) ---
    import KeyMetrics from './widgets/KeyMetrics.svelte'; 
    import Profitability from '../analytics/Profitability.svelte'; 
    import SalesByToken from './widgets/SalesByToken.svelte'; 
    import SalesOverTime from './widgets/SalesOverTime.svelte'; 
    import SalesByCategory from '../analytics/SalesByCategory.svelte'; 
    import TopSellingProducts from '../analytics/TopSellingProducts.svelte'; 
    import PendingInvoices from './widgets/PendingInvoices.svelte'; 
    import LowStockAlerts from './widgets/LowStockAlerts.svelte'; 

    
    
    let ready = false; 
    let sales = []; 
    
    // --- Data Preparation: Combines POS transactions and Paid Invoices ---
    $: {
        const prices = get(tokenPrices);
        if (Object.keys(prices).length > 0) {
            ready = true;
        }
        
        const paidInvoicesAsSales = get(invoices).filter(inv => inv.status === 'Paid').map(inv => ({
            timestamp: dayjs(inv.issueDate).unix(),
            uiAmount: inv.total,
            mint: inv.paymentCurrency,
            items: inv.items,
            txid: `invoice-${inv.id}`,
            customerId: inv.customerId
        }));
        // Sales array containing both successArray (POS) and paid invoices
        sales = [...get(successArray), ...paidInvoicesAsSales];
    }

    onMount(() => {
        if(browser) {
            // Optional: check for readiness or redirect if setup isn't complete.
        }
    });

</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div id="dashboard-header" class="flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
        <h1 class="text-4xl font-greycliffbold text-center sm:text-left">Analytics Dashboard</h1>
        <div class="flex gap-2">
            <a href="/analytics" class="btn btn-secondary">Full Reports</a>
        </div>
    </div>
    
    <div id="dashboard-nav-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
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

    <div class="divider text-xl font-greycliffbold mt-8 mb-4">Performance Overview</div>

    {#if ready}
        <div id="professional-charts-grid" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="lg:col-span-2 card bg-base-100 shadow-xl border">
                    <KeyMetrics />
                </div>
                <div class="lg:col-span-2">
                    <Profitability sales={sales} />
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="card bg-base-100 shadow-xl border">
                    <SalesOverTime />
                </div>
                <div class="card bg-base-100 shadow-xl border">
                    <SalesByToken />
                </div>
                <div class="card bg-base-100 shadow-xl border">
                    <SalesByCategory sales={sales} />
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card bg-base-100 shadow-xl border">
                    <TopSellingProducts sales={sales} />
                </div>
                <div class="space-y-6">
                    <div class="card bg-base-100 shadow-xl border">
                        <PendingInvoices />
                    </div>
                     <div class="card bg-base-100 shadow-xl border">
                        <LowStockAlerts />
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="text-center p-8 mt-8">
            <span class="loading loading-spinner loading-lg"></span>
            <p>Loading Dashboard Data...</p>
        </div>
    {/if}
</div>
