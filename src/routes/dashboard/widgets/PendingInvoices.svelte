<script lang='ts'>
    import { invoices } from '../../stores.js';
    import { goto } from '$app/navigation';
    import dayjs from 'dayjs';

    $: pendingInvoices = $invoices.filter(invoice => invoice.status !== 'Paid');
    $: overdueInvoices = pendingInvoices.filter(invoice => dayjs(invoice.dueDate).isBefore(dayjs()));
</script>

<div class="card-body">
    <h2 class="card-title text-xl font-greycliffmed mb-4">Pending Invoices</h2>
    {#if pendingInvoices.length > 0}
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Due Date</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each pendingInvoices as invoice}
                        <tr class:text-error={dayjs(invoice.dueDate).isBefore(dayjs())}>
                            <td>{invoice.customerName}</td>
                            <td>{dayjs(invoice.dueDate).format('YYYY-MM-DD')}</td>
                            <td class="text-right font-mono">${(invoice.total || 0).toFixed(2)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="card-actions justify-center mt-4">
            <button on:click={() => goto('/invoicing')} class="btn btn-sm btn-outline">Manage Invoices</button>
        </div>
    {:else}
        <p class="text-center">No pending invoices.</p>
    {/if}
</div>
