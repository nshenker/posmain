<script lang='ts'>
    import { onMount } from "svelte";
    import { invoices, storeName } from '../stores.js';
    import dayjs from 'dayjs';

    let newInvoice = {
        id: '',
        customer: '',
        amount: 0,
        dueDate: '',
        paid: false
    };

    function addInvoice() {
        if (newInvoice.customer && newInvoice.amount > 0 && newInvoice.dueDate) {
            $invoices = [...$invoices, { ...newInvoice, id: Date.now().toString() }];
            newInvoice = { id: '', customer: '', amount: 0, dueDate: '', paid: false }; // Reset form
        }
    }

    function togglePaid(invoiceId) {
        $invoices = $invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, paid: !inv.paid } : inv
        );
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold text-charcoal">
            Invoicing
        </h1>
    </header>

    <div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200 mx-auto">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Create New Invoice</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Customer Name" class="input input-bordered" bind:value={newInvoice.customer} />
                <input type="number" placeholder="Amount" class="input input-bordered" bind:value={newInvoice.amount} />
                <input type="date" class="input input-bordered" bind:value={newInvoice.dueDate} />
            </div>
            <div class="card-actions justify-end mt-4">
                <button class="btn btn-primary" on:click={addInvoice}>Add Invoice</button>
            </div>
        </div>
    </div>

    <div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200 mx-auto mt-6">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">All Invoices</h2>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $invoices as invoice}
                            <tr class="hover">
                                <td>{invoice.customer}</td>
                                <td class="font-mono">${invoice.amount}</td>
                                <td>{dayjs(invoice.dueDate).format("YYYY-MM-DD")}</td>
                                <td>{invoice.paid ? 'Paid' : 'Unpaid'}</td>
                                <td>
                                    <button class="btn btn-xs" on:click={() => togglePaid(invoice.id)}>
                                        {invoice.paid ? 'Mark Unpaid' : 'Mark Paid'}
                                    </button>
                                </td>
                            </tr>
                        {/each}
                        {#if $invoices.length === 0}
                            <tr>
                                <td colspan="5" class="text-center text-gray-500 py-4">No invoices yet.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
