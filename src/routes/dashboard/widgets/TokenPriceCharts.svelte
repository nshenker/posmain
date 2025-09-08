<script lang='ts'>
    import { getChartDataForCoin } from '../../priceStore.js';
    import { mints } from '../../stores.js';
    import { browser } from '$app/environment';
    import { Chart, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, TimeScale } from 'chart.js';
    import { Line } from 'svelte-chartjs';
    import 'chartjs-adapter-date-fns';

    Chart.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, TimeScale);

    let activeTab = 'solana';
    let activeTimeframe = 7; // Default to 7 days
    
    const timeframes = [ { label: '1D', days: 1 }, { label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: '90D', days: 90 }];
    const chartableMints = $mints.filter(m => m.name !== 'USDC');
    
    // Get the name of the active token
    $: activeTokenName = chartableMints.find(m => m.coingeckoId === activeTab)?.name;

    // --- Chart Configuration ---
    $: chartOptions = {
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: activeTimeframe <= 2 ? 'hour' : 'day', // Use 'hour' for 1D, 'day' for longer
                },
                ticks: {
                    maxTicksLimit: 8,
                    color: 'rgba(128, 128, 128, 0.8)'
                },
                grid: {
                    color: 'rgba(128, 128, 128, 0.1)'
                }
            },
            y: {
                ticks: {
                    callback: function(value) {
                        if (typeof value === 'number' && value < 0.001) {
                            return value.toExponential(2);
                        }
                        return '$' + value.toLocaleString('en-US');
                    },
                    color: 'rgba(128, 128, 128, 0.8)'
                },
                 grid: {
                    color: 'rgba(128, 128, 128, 0.1)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };
</script>

<div class="card-body">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 class="card-title text-xl font-greycliffmed">Token Price Charts</h2>
        <div class="join">
            {#each timeframes as timeframe}
                <button 
                    class="btn btn-xs join-item"
                    class:btn-primary={activeTimeframe === timeframe.days}
                    on:click={() => activeTimeframe = timeframe.days}
                >
                    {timeframe.label}
                </button>
            {/each}
        </div>
    </div>


    <div role="tablist" class="tabs tabs-boxed">
        {#each chartableMints as mint}
            <button
                role="tab"
                class="tab"
                class:tab-active={activeTab === mint.coingeckoId}
                on:click={() => activeTab = mint.coingeckoId}
            >
                {mint.name}
            </button>
        {/each}
    </div>

    <div class="mt-4 relative h-64 flex items-center justify-center">
        {#key activeTab + activeTimeframe}
            {#await getChartDataForCoin(activeTab, activeTimeframe)}
                 <p class="text-center">Loading chart data...</p>
            {:then prices}
                {#if prices && prices.length > 0}
                     <Line 
                        data={{
                            datasets: [
                                {
                                    label: `${activeTokenName} Price (USD)`,
                                    data: prices.map(([timestamp, price]) => ({ x: timestamp, y: price })),
                                    borderColor: 'rgb(75, 192, 192)',
                                    tension: 0.1,
                                    pointRadius: 0,
                                },
                            ],
                        }} 
                        options={chartOptions} 
                    />
                {:else}
                    <p class="text-center text-error">No data available for this timeframe.</p>
                {/if}
            {:catch error}
                 <p class="text-center text-error">Error: {error.message}</p>
            {/await}
        {/key}
    </div>
</div>
