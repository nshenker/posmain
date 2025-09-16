<script lang='ts'>
    import { successArray, mints, inventory, categories, invoices } from '../stores.js';
    import { tokenPrices } from '../priceStore.js';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from 'chart.js';
    import { Pie, Line, Bar } from 'svelte-chartjs';
    import dayjs from 'dayjs';
    Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement);

    let totalRevenue = 0;
    let totalTransactions = 0;
    let averageSale = 0;
    let totalProfit = 0;
    let averageProfitMargin = 0;

    let salesByTokenData = {};
    let salesOverTimeData = {};
    let salesByCategoryData = {};
    let topSellingProducts = [];
    let salesByDayOfWeekData = {};
    
    let ready = false;
    let activeTimeframe = 'all';

    onMount(() => {
        const unsubscribe = tokenPrices.subscribe(prices => {
            if (Object.keys(prices).length > 0) {
                ready = true;
            }
        });

        return unsubscribe;
    });

    $: paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
        timestamp: dayjs(inv.issueDate).unix(),
        uiAmount: inv.total,
        mint: inv.paymentCurrency,
        items: inv.items,
        txid: `invoice-${inv.id}`
    }));

    $: allSales = [...$successArray, ...paidInvoicesAsSales];

    $: filteredSales = (() => {
        const now = dayjs();
        if (activeTimeframe === '7') {
            return allSales.filter(sale => now.diff(dayjs.unix(sale.timestamp), 'day') <= 7);
        } else if (activeTimeframe === '30') {
            return allSales.filter(sale => now.diff(dayjs.unix(sale.timestamp), 'day') <= 30);
        } else {
            return allSales;
        }
    })();

    $: if (ready) {
        const mintMap = new Map($mints.map(m => [m.mint, m.coingeckoId]));
        const inventoryMap = new Map($inventory.map(item => [item.id, item]));
        const currentTokenPrices = get(tokenPrices);

        const getTxnUsdValue = (txn) => {
            const mintInfo = $mints.find(m => m.name === txn.mint);
            if (!mintInfo) return 0;
            
            const coingeckoId = mintMap.get(mintInfo.mint);
            const price = currentTokenPrices[coingeckoId]?.usd || 0;
            return txn.uiAmount * price;
        };

        totalTransactions = filteredSales.length;
        if (totalTransactions > 0 && Object.keys(currentTokenPrices).length > 0) {
            totalRevenue = filteredSales.reduce((acc, curr) => acc + getTxnUsdValue(curr), 0);
            averageSale = totalRevenue / totalTransactions;

            totalProfit = filteredSales.reduce((acc, sale) => {
                const saleProfit = (sale.items || []).reduce((itemAcc, item) => {
                    const inventoryItem = inventoryMap.get(item.id);
                    if (inventoryItem) {
                        return itemAcc + (item.price - inventoryItem.cost) * item.quantity;
                    }
                    return itemAcc;
                }, 0);
                return acc + saleProfit;
            }, 0);
            averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        } else {
            totalRevenue = 0;
            averageSale = 0;
            totalProfit = 0;
            averageProfitMargin = 0;
        }

        const salesByToken = filteredSales.reduce((acc, curr) => {
            const usdValue = getTxnUsdValue(curr);
            acc[curr.mint] = (acc[curr.mint] || 0) + usdValue;
            return acc;
        }, {});
        salesByTokenData = {
            labels: Object.keys(salesByToken),
            datasets: [
                {
                    label: 'Sales by Token (USD)',
                    data: Object.values(salesByToken),
                    backgroundColor: ['#2775ca', '#9945FF', '#FBAE26'],
                    hoverOffset: 4
                },
            ],
        };

        const salesByDay = filteredSales.reduce((acc, curr) => {
            const date = dayjs.unix(curr.timestamp).format('YYYY-MM-DD');
            const usdValue = getTxnUsdValue(curr);
            acc[date] = (acc[date] || 0) + usdValue;
            return acc;
        }, {});
        const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(a) - new Date(b));
        salesOverTimeData = {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Daily Sales Volume (USD)',
                    data: sortedDates.map(date => salesByDay[date]),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };

        const salesByCategory = filteredSales.reduce((acc, sale) => {
            (sale.items || []).forEach(item => {
                const inventoryItem = inventoryMap.get(item.id);
                if (inventoryItem) {
                    const category = inventoryItem.category || 'Default';
                    acc[category] = (acc[category] || 0) + (item.price * item.quantity);
                }
            });
            return acc;
        }, {});
        salesByCategoryData = {
            labels: Object.keys(salesByCategory),
            datasets: [{
                label: 'Sales by Category',
                data: Object.values(salesByCategory),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }],
        };
        
        topSellingProducts = filteredSales.flatMap(sale => sale.items || []).reduce((acc, item) => {
            const existing = acc.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += item.quantity;
                existing.revenue += item.price * item.quantity;
            } else {
                acc.push({ ...item, revenue: item.price * item.quantity });
            }
            return acc;
        }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

        const salesByDayOfWeek = filteredSales.reduce((acc, sale) => {
            const dayOfWeek = dayjs.unix(sale.timestamp).format('dddd');
            acc[dayOfWeek] = (acc[dayOfWeek] || 0) + getTxnUsdValue(sale);
            return acc;
        }, {});
        salesByDayOfWeekData = {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [{
                label: 'Sales by Day of the Week (USD)',
                data: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => salesByDayOfWeek[day] || 0),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        };
    }

    function exportToCsv() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Transaction ID,Amount,Currency,Profit\n";
        
        filteredSales.forEach(sale => {
            const saleProfit = (sale.items || []).reduce((itemAcc, item) => {
                const inventoryItem = $inventory.find(i => i.id === item.id);
                if (inventoryItem) {
                    return itemAcc + (item.price - inventoryItem.cost) * item.quantity;
                }
                return itemAcc;
            }, 0);
            
            const row = [
                dayjs.unix(sale.timestamp).format('YYYY-MM-DD HH:mm:ss'),
                sale.txid,
                sale.uiAmount,
                sale.mint,
                saleProfit.toFixed(2)
            ].join(',');
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Reporting & Analytics</h1>
    </header>

    <div class="flex justify-end mb-4">
        <select bind:value={activeTimeframe} class="select select-bordered">
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
        </select>
  
		<button class="btn btn-primary ml-4" on:click={exportToCsv}>Export to CSV</button>
    </div>

    {#if ready}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card bg-base-100 shadow-xl border">
                <div class="card-body items-center text-center">
              
                 
					<h2 class="card-title text-xl font-greycliffmed">Total Revenue</h2>
                    <p class="text-3xl font-mono">${totalRevenue.toFixed(2)}</p>
                </div>
            </div>
            <div class="card bg-base-100 shadow-xl border">
                <div class="card-body items-center text-center">
     
   
					<h2 class="card-title text-xl font-greycliffmed">Total Profit</h2>
                    <p class="text-3xl font-mono">${totalProfit.toFixed(2)}</p>
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
                    <h2 class="card-title text-xl font-greycliffmed">Avg. Profit Margin</h2>
                    <p class="text-3xl font-mono">{averageProfitMargin.toFixed(2)}%</p>
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
                        <p class="text-center">No sales data available.</p>
                    {/if}
                </div>
         
       
			</div>
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
            <div class="card bg-base-100 shadow-xl border">
                <div class="card-body">
                    <h2 class="card-title text-xl font-greycliffmed mb-4">Top-Selling Products</h2>
         
					<div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
  
									<th>Product</th>
                                    <th class="text-right">Units Sold</th>
                            
									<th class="text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
   
								{#each topSellingProducts as product}
                                    <tr>
                                
										<td>{product.name}</td>
                                        <td class="text-right">{product.quantity}</td>
                                        <td class="text-right">${product.revenue.toFixed(2)}</td>
          
									</tr>
                                {/each}
                            </tbody>
              
						</table>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 shadow-xl border col-span-full">
                <div class="card-body">
        
					<h2 class="card-title text-xl font-greycliffmed mb-4">Sales by Day of the Week</h2>
                    <div class="h-64">
                        <Bar data={salesByDayOfWeekData} options={{ maintainAspectRatio: false }} />
                    </div>
        
				</div>
            </div>
        </div>
    {:else}
        <div class="text-center p-8">
            <p>Loading real-time price data...</p>
        </div>
    {/if}
</div>
