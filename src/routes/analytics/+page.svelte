<script lang='ts'>
    import { successArray } from '../stores.js';
    import { onMount } from 'svelte';
    import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from 'chart.js';
    import { Bar, Pie, Line } from 'svelte-chartjs';
    import dayjs from 'dayjs';

    Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement);

    let totalRevenue = 0;
    let totalTransactions = 0;
    let averageSale = 0;
    let salesByTokenData = {};
    let salesOverTimeData = {};

    onMount(() => {
        // --- Key Metrics Calculations ---
        totalTransactions = $successArray.length;
        if (totalTransactions > 0) {
            totalRevenue = $successArray.reduce((acc, curr) => acc + curr.uiAmount, 0);
            averageSale = totalRevenue / totalTransactions;
        }

        // --- Sales by Token Calculation ---
        const salesByToken = $successArray.reduce((acc, curr) => {
            acc[curr.mint] = (acc[curr.mint] || 0) + curr.uiAmount;
            return acc;
        }, {});

        salesByTokenData = {
            labels: Object.keys(salesByToken),
            datasets: [
                {
                    label: 'Sales by Token',
                    data: Object.values(salesByToken),
                    backgroundColor: ['#2775ca', '#9945FF', '#FBAE26'],
                    hoverOffset: 4
                },
            ],
        };

        // --- Sales Over Time Calculation (by day) ---
        const salesByDay = $successArray.reduce((acc, curr) => {
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
    });
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold text-charcoal">Reporting & Analytics</h1>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-base-100 shadow-xl border">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-xl font-greycliffmed">Total Revenue</h2>
                <p class="text-3xl font-mono">${totalRevenue.toFixed(2)}</p>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl border">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-xl font-greycliffmed">Total Transactions</h2>
                <p class="text-3xl font-mono">{totalTransactions}</p>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl border">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-xl font-greycliffmed">Average Sale</h2>
                <p class="text-3xl font-mono">${averageSale.toFixed(2)}</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div class="card bg-base-100 shadow-xl border">
            <div class="card-body">
                <h2 class="card-title text-xl font-greycliffmed mb-4">Sales by Token</h2>
                {#if salesByTokenData.labels && salesByTokenData.labels.length}
                    <Pie data={salesByTokenData} />
                {:else}
                    <p class="text-center text-gray-500">No sales data available.</p>
                {/if}
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl border">
            <div class="card-body">
                <h2 class="card-title text-xl font-greycliffmed mb-4">Sales Over Time</h2>
                 {#if salesOverTimeData.labels && salesOverTimeData.labels.length}
                    <Line data={salesOverTimeData} />
                {:else}
                    <p class="text-center text-gray-500">No sales data available.</p>
                {/if}
            </div>
        </div>
    </div>
</div>
