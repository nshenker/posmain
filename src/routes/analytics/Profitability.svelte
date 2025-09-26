<script lang='ts'>
    import { inventory } from '../stores.js';
    export let sales;

    $: inventoryMap = new Map($inventory.map(item => [item.id, item]));

    $: totalProfit = sales.reduce((acc, sale) => {
        const saleProfit = (sale.items || []).reduce((itemAcc, item) => {
            const inventoryItem = inventoryMap.get(item.id);
            if (inventoryItem) {
                return itemAcc + (item.price - inventoryItem.cost) * item.quantity;
            }
            return itemAcc;
        }, 0);
        return acc + saleProfit;
    }, 0);

    $: totalRevenue = sales.reduce((acc, sale) => acc + sale.uiAmount, 0);

    $: averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
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
