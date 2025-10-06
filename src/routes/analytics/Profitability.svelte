<script lang='ts'>
    import { inventory, successArray, invoices, mints } from '../stores.js';
    import { tokenPrices } from '../priceStore.js';
    import { get } from 'svelte/store';
    export let sales;

    $: inventoryMap = new Map($inventory.map(item => [item.id, item]));

    $: totalCostOfGoodsSold = sales.reduce((acc, sale) => {
        const saleCost = (sale.items || []).reduce((itemAcc, soldItem) => {
            const parentItem = inventoryMap.get(soldItem.id);
            if (parentItem) {
                let itemCost = 0;
                if (parentItem.type === 'simple') {
                    itemCost = parentItem.cost || 0;
                } else if (parentItem.type === 'variable' && soldItem.variantId) {
                    const variant = parentItem.variants.find(v => v.id === soldItem.variantId);
                    if (variant) {
                        itemCost = variant.cost || 0;
                    }
                }
                return itemAcc + (itemCost * soldItem.quantity);
            }
            return itemAcc;
        }, 0);
        return acc + saleCost;
    }, 0);

    $: totalRevenueUSD = sales.reduce((acc, sale) => {
        const prices = get(tokenPrices);
        if (sale.mint === 'USD') {
            return acc + sale.uiAmount;
        }
        const mintInfo = get(mints).find(m => m.name === sale.mint);
        if (mintInfo && prices[mintInfo.coingeckoId]) {
            return acc + (sale.uiAmount * prices[mintInfo.coingeckoId].usd);
        }
        return acc;
    }, 0);

    $: totalProfit = totalRevenueUSD - totalCostOfGoodsSold;
    $: averageProfitMargin = totalRevenueUSD > 0 ? (totalProfit / totalRevenueUSD) * 100 : 0;

</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">Total Profit</h2>
            <p class="text-3xl font-mono">${totalProfit.toFixed(2)}</p>
        </div>
    </div>
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">Avg. Profit Margin</h2>
            <p class="text-3xl font-mono">{averageProfitMargin.toFixed(2)}%</p>
        </div>
    </div>
</div>
