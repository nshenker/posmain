<script lang='ts'>
    export let sales;

    $: topSellingProducts = sales.flatMap(sale => sale.items || []).reduce((acc, item) => {
        const existing = acc.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += item.price * item.quantity;
        } else {
            acc.push({ ...item, revenue: item.price * item.quantity });
        }
        return acc;
    }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
</script>

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
