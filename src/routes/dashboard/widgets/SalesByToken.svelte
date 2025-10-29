<script lang='ts'>
    import { onMount } from 'svelte';
    import { successArray, invoices } from '../../stores.js';
    import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js';
    import { Pie } from 'svelte-chartjs';
    import dayjs from 'dayjs';

    let salesByTokenData = {};
    let ready = false;

    onMount(() => {
        Chart.register(Title, Tooltip, Legend, ArcElement);
        ready = true;
    });

    $: {
        if(ready) {
            const paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
                uiAmount: inv.total,
                mint: inv.paymentCurrency,
            }));

            const allSales = [...$successArray, ...paidInvoicesAsSales];

            const salesByToken = allSales.reduce((acc, curr) => {
                acc[curr.mint] = (acc[curr.mint] || 0) + curr.uiAmount;
                return acc;
            }, {});

            salesByTokenData = {
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
        }
    }
</script>

<div class="card-body">
    <h2 class="card-title text-xl font-greycliffmed mb-4">Sales by Token</h2>
    <div class="relative h-64">
        {#if ready && salesByTokenData.labels && salesByTokenData.labels.length}
            <Pie data={salesByTokenData} options={{ maintainAspectRatio: false }} />
        {:else}
            <p class="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">No sales data available.</p>
        {/if}
    </div>
</div>
