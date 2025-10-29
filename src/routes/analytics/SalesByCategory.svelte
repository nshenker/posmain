<script lang='ts'>
    import { Pie } from 'svelte-chartjs';
    import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js';
    import { inventory } from '../stores.js';
    Chart.register(Title, Tooltip, Legend, ArcElement);
    export let sales;
    
    $: inventoryMap = new Map($inventory.map(item => [item.id, item]));

    $: salesByCategory = sales.reduce((acc, sale) => {
        (sale.items || []).forEach(item => {
            const inventoryItem = inventoryMap.get(item.id);
            if (inventoryItem) {
                const category = inventoryItem.category || 'Default';
                acc[category] = (acc[category] || 0) + (item.price * item.quantity);
            }
        });
        return acc;
    }, {});
    
    $: salesByCategoryData = {
        labels: Object.keys(salesByCategory),
        datasets: [{
            label: 'Sales by Category',
            data: Object.values(salesByCategory),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }],
    };
</script>

<div class="card bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Sales by Category</h2>
        {#if salesByCategoryData.labels && salesByCategoryData.labels.length}
            <Pie data={salesByCategoryData} />
        {:else}
            <p class="text-center">No sales data available.</p>
        {/if}
    </div>
</div>
