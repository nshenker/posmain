<script lang='ts'>
    import { inventory, invoices, storeName } from '../stores.js';
    import dayjs from 'dayjs';

    // --- State for the invoice form ---
    let currentInvoice = createNewInvoice();
    let selectedItemId = '';
    let selectedItemQty = 1;

    // --- Reactive calculations ---
    $: subtotal = currentInvoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    $: taxAmount = subtotal * (currentInvoice.taxRate / 100);
    $: total = subtotal + taxAmount;

    // --- Functions ---
    function createNewInvoice() {
        const nextInvoiceNumber = $invoices.length + 1;
        return {
            id: null,
            number: `INV-${String(nextInvoiceNumber).padStart(4, '0')}`,
            customerName: '',
            issueDate: dayjs().format('YYYY-MM-DD'),
            dueDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
            items: [],
            taxRate: 8.875,
            status: 'Draft'
        };
    }

    function handleAddItem() {
        const itemToAdd = $inventory.find(i => i.id === selectedItemId);
        if (!itemToAdd) {
            alert('Please select an item.');
            return;
        }

        const existingItem = currentInvoice.items.find(i => i.id === selectedItemId);
        if (existingItem) {
            existingItem.quantity += selectedItemQty;
            currentInvoice.items = currentInvoice.items; // Trigger reactivity
        } else {
            currentInvoice.items = [
                ...currentInvoice.items,
                { ...itemToAdd, quantity: selectedItemQty }
            ];
        }

        // Reset selection
        selectedItemId = '';
        selectedItemQty = 1;
    }

    function removeItem(itemId) {
        currentInvoice.items = currentInvoice.items.filter(i => i.id !== itemId);
    }

    function saveInvoice() {
        if (!currentInvoice.customerName.trim()) {
            alert('Please enter a customer name.');
            return;
        }
        if (currentInvoice.items.length === 0) {
            alert('Please add at least one item to the invoice.');
            return;
        }

        const invoiceToSave = { ...currentInvoice, id: currentInvoice.id || Date.now(), status: 'Saved' };

        const existingIndex = $invoices.findIndex(inv => inv.id === invoiceToSave.id);
        if (existingIndex > -1) {
            $invoices[existingIndex] = invoiceToSave;
            $invoices = $invoices; // Trigger reactivity
        } else {
            $invoices = [...$invoices, invoiceToSave];
        }

        // Deduct from inventory
        invoiceToSave.items.forEach(invoiceItem => {
            $inventory = $inventory.map(invItem => {
                if (invItem.id === invoiceItem.id) {
                    return { ...invItem, quantity: invItem.quantity - invoiceItem.quantity };
                }
                return invItem;
            });
        });

        alert(`Invoice ${invoiceToSave.number} saved!`);
        currentInvoice = createNewInvoice();
    }

    function loadInvoice(invoiceId) {
        const invoiceToLoad = $invoices.find(inv => inv.id === invoiceId);
        if (invoiceToLoad) {
            currentInvoice = JSON.parse(JSON.stringify(invoiceToLoad));
        }
    }
    
    function printInvoice() {
        window.print();
    }

</script>

<style>
    .invoice-preview {
        font-family: 'Arial', sans-serif;
    }
    @media print {
        body * {
            visibility: hidden;
        }
        .printable-area, .printable-area * {
            visibility: visible;
        }
        .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        .no-print {
            display: none;
        }
    }
</style>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6 no-print">
        <h1 class="text-4xl font-greycliffbold text-charcoal">
            Invoicing
        </h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="no-print">
            <div class="card w-full bg-base-100 shadow-xl border border-gray-200">
                <div class="card-body p-6">
                    <h2 class="card-title text-xl font-greycliffmed">Invoice Details</h2>
                    <div class="form-control">
                        <label class="label"><span class="label-text">Customer Name</span></label>
                        <input type="text" placeholder="Customer Name" class="input input-bordered" bind:value={currentInvoice.customerName} />
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-2">
                        <div class="form-control">
                            <label class="label"><span class="label-text">Issue Date</span></label>
                            <input type="date" class="input input-bordered" bind:value={currentInvoice.issueDate} />
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text">Due Date</span></label>
                            <input type="date" class="input input-bordered" bind:value={currentInvoice.dueDate} />
                        </div>
                    </div>
                </div>
            </div>

            <div class="card w-full bg-base-100 shadow-xl border border-gray-200 mt-6">
                <div class="card-body p-6">
                    <h2 class="card-title text-xl font-greycliffmed">Add Items</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div class="form-control md:col-span-2">
                            <label class="label"><span class="label-text">Select Item from Inventory</span></label>
                            <select class="select select-bordered" bind:value={selectedItemId}>
                                <option disabled selected value="">Select an item</option>
                                {#each $inventory as item}
                                    <option value={item.id}>{item.name} (Stock: {item.quantity})</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text">Quantity</span></label>
                            <input type="number" bind:value={selectedItemQty} min="1" class="input input-bordered">
                        </div>
                    </div>
                    <div class="card-actions justify-end mt-4">
                        <button class="btn btn-secondary" on:click={handleAddItem}>Add Item</button>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-4 justify-center">
                <button class="btn btn-success btn-wide" on:click={saveInvoice}>Save Invoice</button>
                <button class="btn btn-info btn-wide" on:click={printInvoice}>Print</button>
                <button class="btn btn-outline btn-wide" on:click={() => {currentInvoice = createNewInvoice()}}>New Invoice</button>
            </div>
        </div>

        <div class="printable-area">
            <div class="card w-full bg-base-100 shadow-xl border border-gray-200">
                <div class="card-body p-8 invoice-preview text-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold font-greycliffbold">{$storeName || 'Your Company'}</h2>
                        </div>
                        <div class="text-right">
                            <h3 class="text-xl font-bold text-gray-800">INVOICE</h3>
                            <p class="text-gray-500">{currentInvoice.number}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-8">
                        <div>
                            <p class="font-bold text-gray-700">Bill To:</p>
                            <p>{currentInvoice.customerName || 'Customer Name'}</p>
                        </div>
                        <div class="text-right">
                            <p><span class="font-bold text-gray-700">Issue Date:</span> {dayjs(currentInvoice.issueDate).format('MMM D, YYYY')}</p>
                            <p><span class="font-bold text-gray-700">Due Date:</span> {dayjs(currentInvoice.dueDate).format('MMM D, YYYY')}</p>
                        </div>
                    </div>
                    <div class="overflow-x-auto mt-6">
                        <table class="table w-full">
                            <thead class="bg-base-200">
                                <tr>
                                    <th>Item</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-right">Price</th>
                                    <th class="text-right">Total</th>
                                    <th class="no-print"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each currentInvoice.items as item (item.id)}
                                <tr>
                                    <td>{item.name}</td>
                                    <td class="text-center">{item.quantity}</td>
                                    <td class="text-right">${item.price.toFixed(2)}</td>
                                    <td class="text-right">${(item.quantity * item.price).toFixed(2)}</td>
                                    <td class="no-print text-center p-1"><button class="btn btn-ghost btn-xs" on:click={() => removeItem(item.id)}>✕</button></td>
                                </tr>
                                {/each}
                                {#if currentInvoice.items.length === 0}
                                <tr><td colspan="5" class="text-center text-gray-400 py-4">No items added yet.</td></tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-end mt-6">
                        <div class="w-full max-w-xs text-right">
                            <div class="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                            <div class="flex justify-between mt-1"><span>Tax ({currentInvoice.taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>
                            <div class="divider my-1"></div>
                            <div class="flex justify-between font-bold text-lg"><span>Total:</span><span>${total.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card w-full bg-base-100 shadow-xl border border-gray-200 mt-8 no-print">
        <div class="card-body p-6">
            <h2 class="card-title text-xl font-greycliffmed">Saved Invoices</h2>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {#each $invoices as invoice (invoice.id)}
                        <tr class="hover">
                            <td>{invoice.number}</td>
                            <td>{invoice.customerName}</td>
                            <td>{dayjs(invoice.issueDate).format('YYYY-MM-DD')}</td>
                            <td class="text-right font-mono">${(invoice.items.reduce((s, i) => s + i.quantity * i.price, 0) * (1 + invoice.taxRate / 100)).toFixed(2)}</td>
                            <td><span class="badge badge-info badge-outline">{invoice.status}</span></td>
                            <td><button class="btn btn-xs" on:click={() => loadInvoice(invoice.id)}>View</button></td>
                        </tr>
                        {/each}
                        {#if $invoices.length === 0}
                        <tr><td colspan="6" class="text-center text-gray-400 py-4">No saved invoices.</td></tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
