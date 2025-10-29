<script lang='ts'>
    import { Pie } from 'svelte-chartjs';
    import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js';
    Chart.register(Title, Tooltip, Legend, ArcElement);
    export let sales;

    $: salesByToken = sales.reduce((acc, curr) => {
        acc[curr.mint] = (acc[curr.mint] || 0) + curr.uiAmount;
        return acc;
    }, {});
    
    $: salesByTokenData = {
        labels: Object.keys(salesByToken),
        datasets: [
            {
                label: 'Sales by Token',
                data: Object.values(salesByToken),
                backgroundColor: ['#2775ca', '#9945FF', '#FBAE26', '#4ade80', '#f87171', '#fbbf24'],
                hoverOffset: 4
            },
        ],
    };
</script>

<div class="card bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Sales by Token</h2>
        {#if salesByTokenData.labels && salesByTokenData.labels.length}
            <Pie data={salesByTokenData} />
        {:else}
            <p class="text-center">No sales data available.</p>
        {/if}
    </div>
</div>
