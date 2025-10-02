<script lang='ts'>
    export let sales;

    $: newCustomers = new Set(sales.map(s => s.customerId)).size;
    $: returningCustomers = sales.length - newCustomers;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">New Customers</h2>
            <p class="text-3xl font-mono">{newCustomers}</p>
        </div>
    </div>
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed">Returning Customers</h2>
            <p class="text-3xl font-mono">{returningCustomers}</p>
        </div>
    </div>
</div>
