<script lang='ts'>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { publicKey } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import NewInvoiceModal from './NewInvoiceModal.svelte';
    import PastInvoicesModal from './PastInvoicesModal.svelte';

    let showNewInvoiceModal = false;
    let showPastInvoicesModal = false;
    let invoiceToEdit = null;
    
    onMount(async () => {
        if (browser && !$publicKey) {
            showToast("Please set your merchant wallet address first.", "error");
            goto('/');
            return;
        }
    });

    function viewInvoice(event) {
        invoiceToEdit = event.detail;
        showPastInvoicesModal = false;
        showNewInvoiceModal = true;
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Invoicing</h1>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div class="card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">New Invoice</h2>
                <p>Create and send a new invoice to a client.</p>
                <div class="card-actions justify-center mt-4">
                    <button class="btn btn-primary" on:click={() => { invoiceToEdit = null; showNewInvoiceModal = true; }}>Create New Invoice</button>
                </div>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed">Past Invoices</h2>
                <p>View, manage, and track the status of all past invoices.</p>
                <div class="card-actions justify-center mt-4">
                    <button class="btn btn-secondary" on:click={() => showPastInvoicesModal = true}>View Past Invoices</button>
                </div>
            </div>
        </div>
    </div>
</div>

{#if showNewInvoiceModal}
    <NewInvoiceModal invoice={invoiceToEdit} on:close={() => showNewInvoiceModal = false} />
{/if}

{#if showPastInvoicesModal}
    <PastInvoicesModal on:close={() => showPastInvoicesModal = false} on:view={viewInvoice} />
{/if}
