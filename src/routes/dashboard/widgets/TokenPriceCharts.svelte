<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store'; // Corrected import
    import { mints } from '../../stores.js'; // Import mints to know which tokens to fetch
    import { getChartDataForCoin } from '../../priceStore.js'; // Import the correct function
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

    let chartData = { datasets: [] };
    let timeframe = '7'; // Default to 7 days, as a string to match API
    let ready = false;
    let loading = true;

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
        ready = true;
    });

    // Reactive statement to refetch data when timeframe changes
    $: if (ready) {
        updateAllChartData(timeframe);
    }

    async function updateAllChartData(days) {
        loading = true;
        const allMints = get(mints);
        const datasets = [];

        for (const mint of allMints) {
            if (mint.coingeckoId) {
                const history = await getChartDataForCoin(mint.coingeckoId, days);
                if (history.length > 0) {
                     datasets.push({
                        label: mint.name,
                        data: history.map(point => ({ x: new Date(point[0]), y: point[1] })),
                        borderColor: getRandomColor(),
                        tension: 0.1,
                        fill: false,
                    });
                }
            }
        }
        
        chartData = { datasets };
        loading = false;
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
            <option value="1">24h</option>
            <option value="7">7d</option>
            <option value="30">30d</option>
        </select>
    </div>
    <div class="relative h-64 mt-4">
        {#if loading}
             <div class="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
            </div>
        {:else if chartData.datasets.length > 0}
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
                <p>Could not load chart data.</p>
            </div>
        {/if}
    </div>
</div>
