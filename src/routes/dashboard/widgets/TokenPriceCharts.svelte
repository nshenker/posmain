<script>
    import { onMount } from 'svelte';
    import { tokenPrices } from '../../priceStore.js';
    import { Line } from 'svelte-chartjs';
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        CategoryScale,
        LinearScale,
        PointElement,
        TimeScale
    } from 'chart.js';
    import 'chartjs-adapter-date-fns';

    let chartData = {};
    let timeframe = '7d'; // Default to 7 days
    let ready = false;

    onMount(() => {
        ChartJS.register(
            Title,
            Tooltip,
            Legend,
            LineElement,
            CategoryScale,
            LinearScale,
            PointElement,
            TimeScale
        );

        const unsubscribe = tokenPrices.subscribe(prices => {
            if (prices && Object.keys(prices).length > 0) {
                updateChartData(prices);
                ready = true;
            }
        });

        return unsubscribe;
    });

    function updateChartData(prices) {
        const datasets = Object.entries(prices).map(([id, data]) => {
            // Check if history exists before trying to access it
            const history = data.history ? data.history[timeframe] || [] : [];
            return {
                label: id.toUpperCase(),
                data: history.map(point => ({ x: new Date(point[0]), y: point[1] })),
                borderColor: getRandomColor(),
                tension: 0.1,
            };
        });

        chartData = {
            datasets,
        };
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
</script>

<div class="card-body">
    <div class="flex justify-between items-center">
        <h2 class="card-title text-xl font-greycliffmed">Token Prices</h2>
        <select class="select select-bordered select-sm" bind:value={timeframe}>
            <option value="1d">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
        </select>
    </div>
    <div class="relative h-64 mt-4">
        {#if ready}
            <Line
                data={chartData}
                options={{
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        }
                    }
                }}
            />
        {:else}
            <div class="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
            </div>
        {/if}
    </div>
</div>
