<script lang='ts'>
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { storeName, merchantLogo, publicKey, dashboardLayout } from '../stores.js';
    import { showToast } from '../toastStore.js';

    // Widget components
    import KeyMetrics from './widgets/KeyMetrics.svelte';
    import RecentTransactions from './widgets/RecentTransactions.svelte';
    import SalesByToken from './widgets/SalesByToken.svelte';
    import SalesOverTime from './widgets/SalesOverTime.svelte';
    import LowStockAlerts from './widgets/LowStockAlerts.svelte';
    import PendingInvoices from './widgets/PendingInvoices.svelte';
    import TokenPriceCharts from './widgets/TokenPriceCharts.svelte';

    // --- State ---
    const devWallet = 'CXfJMf3d8mm96RGtttztVcCwTGr1Dwnk6vypRAhZs6Yo';
    let showWidgetSelector = false;

    const widgetComponents = {
        keyMetrics: KeyMetrics,
        recentTransactions: RecentTransactions,
        salesByToken: SalesByToken,
        salesOverTime: SalesOverTime,
        lowStockAlerts: LowStockAlerts,
        pendingInvoices: PendingInvoices,
        tokenPriceCharts: TokenPriceCharts,
    };
    
    // Default widget names to prevent "undefined" labels if localStorage data is stale
    const defaultWidgets = [
        { id: 'keyMetrics', name: 'Key Metrics' },
        { id: 'recentTransactions', name: 'Recent Transactions' },
        { id: 'salesByToken', name: 'Sales by Token' },
        { id: 'salesOverTime', name: 'Sales Over Time' },
        { id: 'lowStockAlerts', name: 'Low Stock Alerts' },
        { id: 'pendingInvoices', name: 'Pending Invoices' },
        { id: 'tokenPriceCharts', name: 'Token Price Charts' }
    ];

    $: widgetsForModal = $dashboardLayout.widgets.map(w => ({
        ...w,
        name: defaultWidgets.find(def => def.id === w.id)?.name || w.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }));


    onMount(() => {
        if (browser && !$publicKey) {
            showToast("Please set your merchant wallet address first.", "error");
            goto('/');
        }
    });

    async function copyAddress() {
        if (browser) {
            try {
                await navigator.clipboard.writeText(devWallet);
                showToast('Address copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy address.', 'error');
            }
        }
    }

    function toggleWidgetVisibility(widgetId) {
        dashboardLayout.update(layout => {
            const widget = layout.widgets.find(w => w.id === widgetId);
            if (widget) {
                widget.visible = !widget.visible;
            }
            return layout;
        });
    }
</script>

<style>
    .dashboard-grid {
        display: grid;
        gap: 1.5rem; /* 24px */
        grid-template-columns: repeat(1, 1fr);
    }

    @media (min-width: 1024px) {
        .dashboard-grid {
            grid-template-columns: repeat(4, 1fr);
        }
        
        .widget-keyMetrics { grid-column: span 4; }
        .widget-recentTransactions { grid-column: span 2; }
        .widget-salesByToken { grid-column: span 2; }
        .widget-salesOverTime { grid-column: span 4; }
        .widget-lowStockAlerts { grid-column: span 2; }
        .widget-pendingInvoices { grid-column: span 2; }
        .widget-tokenPriceCharts { grid-column: span 4; }
    }
</style>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">
            {$storeName} Merchant Suite
        </h1>
        {#if $merchantLogo}
            <img src={$merchantLogo} alt="Merchant Logo" class="h-24 mx-auto mt-4">
        {/if}
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Point of Sale</h2>
                <p>Create charges and accept payments in Solana.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/pos')} class="btn btn-primary">Go to POS</button>
                </div>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Invoicing</h2>
                <p>Manage your customer invoices.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/invoicing')} class="btn btn-primary">Manage Invoices</button>
                </div>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Inventory</h2>
                <p>Keep track of your product inventory.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/inventory')} class="btn btn-primary">Manage Inventory</button>
                </div>
            </div>
        </div>
        
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Analytics</h2>
                <p>View your sales data and analytics.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/analytics')} class="btn btn-primary">View Analytics</button>
                </div>
            </div>
        </div>
    </div>

    <div class="divider my-8 px-4">
        <div class="flex items-center gap-4">
            <h2 class="text-2xl font-greycliffbold">Widgets</h2>
            <button on:click={() => showWidgetSelector = true} class="btn btn-sm btn-outline">Edit Widgets</button>
        </div>
    </div>

    <div class="dashboard-grid">
        {#each $dashboardLayout.widgets as widget}
            {#if widget.visible}
                <div class="widget-{widget.id}">
                    <div class="card bg-base-100 shadow-xl border border-gray-200 h-full w-full overflow-hidden">
                        <svelte:component this={widgetComponents[widget.id]} />
                    </div>
                </div>
            {/if}
        {/each}
    </div>

    <div class="text-center mt-12">
        <p class="text-sm">Enjoying PoSolana? Consider supporting the developer.</p>
        <div class="input-group mt-2 justify-center">
            <input type="text" value={devWallet} readonly class="input input-bordered w-full max-w-xs text-xs" />
            <button class="btn btn-square" on:click={copyAddress}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
        </div>
    </div>
</div>

{#if showWidgetSelector}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Select Widgets</h3>
            <div class="py-4 max-h-96 overflow-y-auto">
                {#each widgetsForModal as widget}
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">{widget.name}</span>
                            <input type="checkbox" checked={widget.visible} on:change={() => toggleWidgetVisibility(widget.id)} class="checkbox checkbox-primary" />
                        </label>
                    </div>
                {/each}
            </div>
            <div class="modal-action">
                <button class="btn" on:click={() => showWidgetSelector = false}>Done</button>
            </div>
        </div>
    </div>
{/if}
