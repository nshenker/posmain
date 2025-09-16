<script lang='ts'>
    import { successArray, invoices } from '../../stores.js';
    import { Chart, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';
    import { Line } from 'svelte-chartjs';
    import dayjs from 'dayjs';

    Chart.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

    let salesOverTimeData = {};

    $: {
        const paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
            timestamp: dayjs(inv.issueDate).unix(),
            uiAmount: inv.total,
        }));

        const allSales = [...$successArray, ...paidInvoicesAsSales];

        const salesByDay = allSales.reduce((acc, curr) => {
            const date = dayjs.unix(curr.timestamp).format('YYYY-MM-DD');
            acc[date] = (acc[date] || 0) + curr.uiAmount;
            return acc;
        }, {});

        const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(a) - new Date(b));

        salesOverTimeData = {
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
    }
</script>

<div class="card-body">
    <h2 class="card-title text-xl font-greycliffmed mb-4">Sales Over Time</h2>
    <div class="relative h-64">
        {#if salesOverTimeData.labels && salesOverTimeData.labels.length}
            <Line data={salesOverTimeData} options={{ maintainAspectRatio: false }}/>
        {:else}
            <p class="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">No sales data available.</p>
        {/if}
    </div>
</div>
