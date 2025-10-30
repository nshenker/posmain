<script lang="ts">
    import dayjs from 'dayjs';

    export let invoiceData: { 
        invoice: any; 
        storeName: string; 
        businessAddress: string; 
    };

    $: invoice = invoiceData.invoice;
    $: storeName = invoiceData.storeName;
    $: businessAddress = invoiceData.businessAddress;

    // Recalculate totals as they might be missing in older saved invoices or if changes occurred
    $: subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    $: taxAmount = invoice.applyTax ? subtotal * (invoice.taxRate / 100) : 0;
    $: total = subtotal + taxAmount;
</script>

<style>
    /* Styles for print optimization, similar to Receipt.svelte */
    .invoice-container {
        font-family: 'monospace', monospace;
        width: 100%; 
        max-width: 800px; /* Standard invoice width */
        margin: 0 auto;
        padding: 20px;
        color: #000;
        background-color: #fff;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }

    .flex-between { display: flex; justify-content: space-between; }
    /* Simple grid for Bill To/Details section */
    .grid-cols-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;}
    
    .line-separator {
        border-top: 1px dashed #000;
        margin: 15px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #eee;
    }
    .total-line {
        font-size: 1.1rem;
        font-weight: bold;
    }
</style>

<div class="invoice-container">
    <div class="flex-between">
        <div>
            <div class="text-2xl font-bold">{storeName || 'Your Company'}</div>
            {#if businessAddress}
                <div class="text-sm" style="white-space: pre-line;">{businessAddress}</div>
            {/if}
        </div>
        <div class="text-right">
            <div class="text-2xl font-bold">INVOICE</div>
            <div class="text-base">No: {invoice.number}</div>
            <div class="text-sm font-bold" style="color: {invoice.status === 'Paid' ? 'green' : invoice.status === 'Overdue' ? 'red' : 'orange'}">Status: {invoice.status.toUpperCase()}</div>
        </div>
    </div>
    
    <div class="line-separator"></div>

    <div class="grid-cols-2 text-base">
        <div>
            <div class="text-base font-bold">BILL TO:</div>
            <div class="text-base">{invoice.customerName || 'N/A'}</div>
            </div>
        <div class="text-right text-sm">
            <div>
                <span class="font-bold">Issue Date:</span> {dayjs(invoice.issueDate).format('MMM D, YYYY')}
            </div>
            <div>
                <span class="font-bold">Due Date:</span> {dayjs(invoice.dueDate).format('MMM D, YYYY')}
            </div>
            <div>
                <span class="font-bold">Payment Currency:</span> {invoice.paymentCurrency}
            </div>
        </div>
    </div>

    <div class="line-separator"></div>

    <table class="text-sm">
        <thead>
            <tr>
                <th style="width: 55%;">DESCRIPTION</th>
                <th style="width: 15%;" class="text-center">QTY</th>
                <th style="width: 15%;" class="text-right">UNIT PRICE</th>
                <th style="width: 15%;" class="text-right">LINE TOTAL</th>
            </tr>
        </thead>
        <tbody>
            {#each invoice.items as item (item.variantId || item.id)}
                <tr>
                    <td>{item.name}</td>
                    <td class="text-center">{item.quantity}</td>
                    <td class="text-right">${(item.price || 0).toFixed(2)}</td>
                    <td class="text-right">${(item.quantity * (item.price || 0)).toFixed(2)}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="line-separator"></div>
    
    <div style="display: flex; justify-content: flex-end;">
        <div style="width: 250px;">
            <div class="flex-between text-sm">
                <span class="font-bold">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            {#if invoice.applyTax}
                <div class="flex-between text-sm">
                    <span class="font-bold">Tax ({invoice.taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
            {/if}
            <div class="line-separator" style="margin: 5px 0; border-top: 1px solid #000;"></div>
            <div class="flex-between total-line">
                <span class="font-bold">TOTAL DUE:</span>
                <span>${total.toFixed(2)} {invoice.paymentCurrency}</span>
            </div>
        </div>
    </div>

    <div class="line-separator"></div>

    <div class="text-center text-sm">
        <p class="font-bold">Thank you for your business!</p>
        {#if invoice.reference}
            <p>Solana Pay Reference for Payment: {invoice.reference}</p>
        {/if}
    </div>
</div>
