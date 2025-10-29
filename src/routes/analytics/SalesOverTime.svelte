<script lang='ts'>
    import { Line } from 'svelte-chartjs';
    import { Chart, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';
    Chart.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);
    import dayjs from 'dayjs';
    export let sales;

    $: salesByDay = sales.reduce((acc, curr) => {
        const date = dayjs.unix(curr.timestamp).format('YYYY-MM-DD');
        acc[date] = (acc[date] || 0) + curr.uiAmount;
        return acc;
    }, {});
    
    $: sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(a) - new Date(b));
    
    $: salesOverTimeData = {
        labels: sortedDates,
        datasets: [
            {
                label: 'Daily Sales Volume',
                data: sortedDates.map(date => salesByDay[date]),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };
</script>

<div class="card bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Sales Over Time</h2>
        {#if salesOverTimeData.labels && salesOverTimeData.labels.length}
            <Line data={salesOverTimeData} />
        {:else}
            <p class="text-center">No sales data available.</p>
        {/if}
    </div>
</div>
