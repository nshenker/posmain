<script lang='ts'>
    import { createEventDispatcher, onMount } from 'svelte';
    import { invoices, inventory, customers } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import { logHistory } from '../../utils/inventory.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';
    import dayjs from 'dayjs';
    import { browser } from '$app/environment';
    
    const dispatch = createEventDispatcher();
    
    let invoiceToRemove = null;
    let findReference, FindReferenceError, web3;
    let librariesLoaded = false;
    
    onMount(async () => {
         if (browser) {
            try {
                const solanaPay = await import('@solana/pay');
                const solanaWeb3 = await import('@solana/web3.js');
                findReference = solanaPay.findReference;
                FindReferenceError = solanaPay.FindReferenceError;
                web3 = solanaWeb3;
                librariesLoaded = true;
                await checkInvoicePayments();
            } catch (e) {
                console.error("Failed to load Solana libraries", e);
                if (browser) showToast("Error: Could not load payment libraries.", "error");
            }
        }
    });

    function confirmRemoveInvoice(invoiceId) {
        invoiceToRemove = invoiceId;
    }

    function doRemoveInvoice() {
        if (invoiceToRemove) {
            $invoices = $invoices.filter(inv => inv.id !== invoiceToRemove);
            invoiceToRemove = null;
        }
    }
    
    function processPaidInvoice(invoice) {
        invoice.status = 'Paid';
        showToast(`Invoice ${invoice.number} was paid!`, 'success');
        
        invoice.items.forEach(item => {
            if (!String(item.id).startsWith('custom-')) {
                inventory.update(invs => {
                    return invs.map(i => {
                        if (i.id === item.id) {
                            if (i.type === 'variable' && item.variantId) {
                                let variantFound = false;
                                i.variants = i.variants.map(v => {
                                    if (v.id === item.variantId) {
                                        const newQty = v.quantity - item.quantity;
                                        logHistory(v.id, `Sale (Invoice ${invoice.number})`, `-${item.quantity}`, newQty);
                                        v.quantity = newQty;
                                        variantFound = true;
                                    }
                                    return v;
                                });
                                if(variantFound) i.quantity = i.variants.reduce((acc, v) => acc + v.quantity, 0);
                            } else {
                                const newQuantity = i.quantity - item.quantity;
                                logHistory(item.id, `Sale (Invoice ${invoice.number})`, `-${item.quantity}`, newQuantity);
                                i.quantity = newQuantity;
                            }
                        }
                        return i;
                    });
                });
            }
        });
        $invoices = $invoices; // Trigger reactivity
    }

    async function checkInvoicePayments() {
        if (!librariesLoaded) return;
        const connection = new web3.Connection("https://solana-mainnet.g.alchemy.com/v2/5Bo-yRwJYXcscWQkkah0KJ-9jPmm5cSi");
        const invoicesToCheck = $invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue');
        for (const invoice of invoicesToCheck) {
            if (dayjs().isAfter(dayjs(invoice.dueDate)) && invoice.status !== 'Overdue') {
                invoice.status = 'Overdue';
            }

            if (invoice.reference) {
                try {
                    await findReference(connection, new web3.PublicKey(invoice.reference), { finality: 'confirmed' });
                    processPaidInvoice(invoice);
                } catch (error) {
                    if (!(error instanceof FindReferenceError)) {
                        console.error(`Error checking invoice ${invoice.number}:`, error);
                    }
                }
            }
        }
        $invoices = $invoices;
    }
    
    function markAsPaid(invoiceId) {
        const invoice = $invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            processPaidInvoice(invoice);
        }
	}

</script>

{#if invoiceToRemove}
    <ConfirmationModal
        message="Are you sure you want to permanently delete this invoice?"
        on:confirm={doRemoveInvoice}
        on:cancel={() => invoiceToRemove = null}
    />
{/if}

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl">
        <h3 class="font-bold text-lg">Past Invoices</h3>
        <div class="py-4">
             <div class="overflow-x-auto">
                <table class="table w-full"><thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {#each $invoices as invoice (invoice.id)}
                        <tr class="hover">
                            <td>{invoice.number}</td>
                            <td>{invoice.customerName}</td>
                            <td>{dayjs(invoice.issueDate).format('YYYY-MM-DD')}</td>
                            <td class="text-right font-mono">${(invoice.total || 0).toFixed(2)}</td>
                            <td><span class="badge badge-info badge-outline">{invoice.status}</span></td>
                            <td class="space-x-1">
                                <button class="btn btn-xs btn-outline" on:click={() => dispatch('view', invoice)}>View</button>
                                <button class="btn btn-xs btn-outline btn-success" on:click={() => markAsPaid(invoice.id)}>Mark Paid</button>
                                <button class="btn btn-xs btn-outline btn-error" on:click={() => confirmRemoveInvoice(invoice.id)}>Delete</button>
                            </td>
                        </tr>
                        {/each}
                        {#if $invoices.length === 0}<tr><td colspan="6" class="text-center opacity-70 py-4">No saved invoices.</td></tr>{/if}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
