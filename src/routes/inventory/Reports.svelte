<script lang="ts">
    import { inventory, successArray } from '../stores.js';
    import dayjs from 'dayjs';

    // --- Inventory Valuation ---
    $: inventoryValue = $inventory.reduce((total, item) => total + (item.quantity * (item.cost || 0)), 0);

    // --- Sales Velocity & Dead Stock ---
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const ninetyDaysAgo = dayjs().subtract(90, 'day');

    // Calculate sales counts for each item
    $: salesData = $successArray.reduce((acc, sale) => {
        // This is a simplified logic. A real implementation would need to link sales to inventory items.
        // For now, we'll assume item names in sales match inventory.
        const itemInInventory = $inventory.find(invItem => invItem.name === sale.mint); // This is a placeholder
        if (itemInInventory) {
            if (!acc[itemInInventory.id]) {
                acc[itemInInventory.id] = { salesCount: 0, lastSaleDate: null };
            }
            acc[itemInInventory.id].salesCount += sale.uiAmount; // Or just +1 if not tracking amount
            acc[itemInInventory.id].lastSaleDate = dayjs.unix(sale.timestamp);
        }
        return acc;
    }, {});

    $: salesVelocity = $inventory.map(item => {
        const data = salesData[item.id];
        const salesLast30Days = data ? (dayjs(data.lastSaleDate).isAfter(thirtyDaysAgo) ? data.salesCount : 0) : 0;
        return { ...item, salesLast30Days };
    }).sort((a, b) => b.salesLast30Days - a.salesLast30Days);
    
    $: deadStock = $inventory.filter(item => {
        const data = salesData[item.id];
        return !data || dayjs(data.lastSaleDate).isBefore(ninetyDaysAgo);
    });

</script>

<div class="grid grid-cols-1 gap-6">
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body p-8 items-center text-center">
             <h2 class="card-title text-xl font-greycliffmed">Inventory Valuation</h2>
             <p class="text-3xl font-mono">${inventoryValue.toFixed(2)}</p>
             <p class="text-sm text-gray-500">Total value of all items in stock based on their cost.</p>
        </div>
    </div>
    
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed mb-4">Sales Velocity (Last 30 Days)</h2>
            <p class="text-sm text-gray-500 mb-4">Top selling items by quantity sold in the last 30 days.</p>
            <div class="overflow-x-auto">
                 <table class="table table-sm w-full">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Units Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each salesVelocity.slice(0, 5) as item}
                            <tr class="hover">
                                <td>{item.name}</td>
                                <td class="text-right font-mono">{item.salesLast30Days}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed mb-4">Dead Stock (No Sales in 90+ Days)</h2>
             <p class="text-sm text-gray-500 mb-4">These items haven't sold recently and might need attention.</p>
            <div class="overflow-x-auto">
                 <table class="table table-sm w-full">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Quantity on Hand</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each deadStock as item}
                             <tr class="hover text-warning">
                                <td>{item.name}</td>
                                <td class="text-right font-mono">{item.quantity}</td>
                            </tr>
                        {/each}
                         {#if deadStock.length === 0}
                            <tr><td colspan="2" class="text-center py-4">No dead stock found.</td></tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
