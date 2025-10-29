<script lang='ts'>
    import { successArray, mints, inventory, categories, invoices, customers } from '../stores.js';
    import { tokenPrices } from '../priceStore.js';
    import { onMount, get } from 'svelte';
    import KeyMetrics from './KeyMetrics.svelte';
    import SalesByToken from './SalesByToken.svelte';
    import SalesOverTime from './SalesOverTime.svelte';
    import SalesByCategory from './SalesByCategory.svelte';
    import TopSellingProducts from './TopSellingProducts.svelte';
    import SalesByDayOfWeek from './SalesByDayOfWeek.svelte';
    import Profitability from './Profitability.svelte';
    import CustomerInsights from './CustomerInsights.svelte';
    import dayjs from 'dayjs';

    let ready = false;
    let activeTimeframe = 'all';
    onMount(() => {
        const unsubscribe = tokenPrices.subscribe(prices => {
            if (Object.keys(prices).length > 0) {
                ready = true;
            }
        });

        return unsubscribe;
    });
    $: paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
        timestamp: dayjs(inv.issueDate).unix(),
        uiAmount: inv.total,
        mint: inv.paymentCurrency,
        items: inv.items,
        txid: `invoice-${inv.id}`,
        customerId: inv.customerId
    }));
    $: allSales = [...$successArray, ...paidInvoicesAsSales];

    $: filteredSales = (() => {
        const now = dayjs();
        if (activeTimeframe === '7') {
            return allSales.filter(sale => now.diff(dayjs.unix(sale.timestamp), 'day') <= 7);
        } else if (activeTimeframe === '30') {
            return allSales.filter(sale => now.diff(dayjs.unix(sale.timestamp), 'day') <= 30);
        } else {
            return allSales;
        }
    })();
    function exportToCsv() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Transaction ID,Amount,Currency,Profit,CustomerID\n";
        filteredSales.forEach(sale => {
            const saleProfit = (sale.items || []).reduce((itemAcc, item) => {
                const inventoryItem = $inventory.find(i => i.id === item.id);
                if (inventoryItem) {
                    return itemAcc + (item.price - inventoryItem.cost) * item.quantity;
                }
                return itemAcc;
            }, 0);
            
            const row = [
                dayjs.unix(sale.timestamp).format('YYYY-MM-DD HH:mm:ss'),
                sale.txid,
                sale.uiAmount,
                sale.mint,
                saleProfit.toFixed(2),
                sale.customerId || 'N/A'
            ].join(',');
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header id="analytics-header" class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Reporting & Analytics</h1>
    </header>

    <div id="analytics-controls" class="flex flex-col sm:flex-row justify-end mb-4 gap-2">
        <select bind:value={activeTimeframe} class="select select-bordered">
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
        </select>
  
		<button class="btn btn-primary" on:click={exportToCsv}>Export to CSV</button>
    </div>

    {#if ready}
        <div class="space-y-6">
            <KeyMetrics sales={filteredSales} />
            <Profitability sales={filteredSales} />
            <CustomerInsights sales={filteredSales} customers={$customers} />
            <div id="analytics-charts-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesByToken sales={filteredSales} />
                <SalesOverTime sales={filteredSales} />
                <SalesByCategory sales={filteredSales} />
                <TopSellingProducts sales={filteredSales} />
                <div class="lg:col-span-2">
                    <SalesByDayOfWeek sales={filteredSales} />
                </div>
            </div>
        </div>
    {:else}
        <div class="text-center p-8">
            <p>Loading real-time price data...</p>
        </div>
    {/if}
</div>
