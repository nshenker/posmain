<script lang='ts'>
    export let sales;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">Total Revenue</h2>
            <p class="text-3xl font-mono">${sales.reduce((acc, sale) => acc + sale.uiAmount, 0).toFixed(2)}</p>
        </div>
    </div>
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">Total Transactions</h2>
            <p class="text-3xl font-mono">{sales.length}</p>
        </div>
    </div>
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">Average Sale</h2>
            <p class="text-3xl font-mono">${(sales.reduce((acc, sale) => acc + sale.uiAmount, 0) / sales.length || 0).toFixed(2)}</p>
        </div>
    </div>
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">New Customers</h2>
            <p class="text-3xl font-mono">{new Set(sales.map(s => s.customerId)).size}</p>
        </div>
    </div>
</div>
