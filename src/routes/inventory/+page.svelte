<script lang='ts'>
    import { inventory, mints } from '../stores.js';

    let newItem = {
        name: '',
        quantity: null,
        price: null,
        currency: 'USDC' // Default currency
    };

    function addItem() {
        const name = newItem.name.trim();
        const quantity = Number(newItem.quantity);
        const price = Number(newItem.price);

        if (name && !isNaN(quantity) && quantity > 0 && !isNaN(price) && price >= 0) {
            const newItemData = {
                id: Date.now().toString(),
                name,
                quantity,
                price,
                currency: newItem.currency
            };
            $inventory = [...$inventory, newItemData];
            
            newItem = { name: '', quantity: null, price: null, currency: 'USDC' };
        } else {
            alert("Please fill out all fields with valid values.");
        }
    }

    function removeItem(itemId) {
        if (confirm("Are you sure you want to remove this item?")) {
            $inventory = $inventory.filter(item => item.id !== itemId);
        }
    }

    function updateQuantity(itemId, amount) {
        $inventory = $inventory.map(item => 
            item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
        );
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold text-charcoal">
            Inventory Management
        </h1>
    </header>

    <div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200 mx-auto">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Add New Item</h2>
            <form on:submit|preventDefault={addItem} class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input type="text" placeholder="Item Name" class="input input-bordered md:col-span-2" bind:value={newItem.name} />
                <input type="number" placeholder="Quantity" class="input input-bordered" bind:value={newItem.quantity} min="1" step="1" />
                <div class="input-group">
                    <input type="number" placeholder="Price" class="input input-bordered w-full" bind:value={newItem.price} min="0" step="0.01" />
                    <select class="select select-bordered" bind:value={newItem.currency}>
                        {#each $mints as mint}
                        <option value={mint.name}>{mint.name}</option>
                        {/each}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Add Item</button>
            </form>
        </div>
    </div>

    <div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200 mx-auto mt-6">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Current Inventory</h2>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-right">Price</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $inventory as item (item.id)}
                            <tr class="hover">
                                <td class="font-greycliffmed">{item.name}</td>
                                <td class="text-center font-mono">{item.quantity}</td>
                                <td class="text-right font-mono">{item.price.toFixed(2)} {item.currency}</td>
                                <td class="text-center space-x-2">
                                    <button class="btn btn-xs btn-outline btn-success" on:click={() => updateQuantity(item.id, 1)}>+</button>
                                    <button class="btn btn-xs btn-outline btn-warning" on:click={() => updateQuantity(item.id, -1)}>-</button>
                                    <button class="btn btn-xs btn-outline btn-error" on:click={() => removeItem(item.id)}>Remove</button>
                                </td>
                            </tr>
                        {/each}
                        {#if $inventory.length === 0}
                            <tr>
                                <td colspan="4" class="text-center text-gray-500 py-4">No items in inventory.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

**File: `src/routes/invoicing/+page.svelte` (Updated)**
```svelte
<script lang='ts'>
    import { inventory, invoices, storeName } from '../stores.js';
    import dayjs from 'dayjs';

    let currentInvoice = createNewInvoice();
    let selectedItemId = '';
    let selectedItemQty = 1;
    let customItem = { name: '', quantity: 1, price: null };

    $: subtotal = currentInvoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    $: taxAmount = subtotal * (currentInvoice.taxRate / 100);
    $: total = subtotal + taxAmount;

    function createNewInvoice() {
        const nextInvoiceNumber = $invoices.length + 1;
        return {
            id: null, number: `INV-${String(nextInvoiceNumber).padStart(4, '0')}`,
            customerName: '', issueDate: dayjs().format('YYYY-MM-DD'),
            dueDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
            items: [], taxRate: 8.875, status: 'Draft'
        };
    }

    function handleAddItemFromInventory() {
        const itemToAdd = $inventory.find(i => i.id === selectedItemId);
        if (!itemToAdd) { alert('Please select an item.'); return; }
        
        addItemToInvoice(itemToAdd, selectedItemQty);
        selectedItemId = '';
        selectedItemQty = 1;
    }

    function handleAddCustomItem() {
        const name = customItem.name.trim();
        const quantity = Number(customItem.quantity);
        const price = Number(customItem.price);

        if (name && quantity > 0 && price >= 0) {
            addItemToInvoice({ id: `custom-${Date.now()}`, name, price }, quantity);
            customItem = { name: '', quantity: 1, price: null };
        } else {
            alert("Please provide a valid name, quantity, and price for the custom item.");
        }
    }

    function addItemToInvoice(item, quantity) {
        const existingItem = currentInvoice.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += quantity;
            currentInvoice.items = currentInvoice.items;
        } else {
            currentInvoice.items = [...currentInvoice.items, { ...item, quantity }];
        }
    }
    
    function removeItem(itemId) {
        currentInvoice.items = currentInvoice.items.filter(i => i.id !== itemId);
    }

    function saveInvoice() {
        if (!currentInvoice.customerName.trim()) { alert('Please enter a customer name.'); return; }
        if (currentInvoice.items.length === 0) { alert('Please add at least one item.'); return; }

        const invoiceToSave = { ...currentInvoice, id: currentInvoice.id || Date.now(), status: 'Saved' };
        const existingIndex = $invoices.findIndex(inv => inv.id === invoiceToSave.id);

        if (existingIndex > -1) {
            $invoices[existingIndex] = invoiceToSave;
        } else {
            $invoices = [...$invoices, invoiceToSave];
        }
        $invoices = $invoices; // Trigger reactivity

        invoiceToSave.items.forEach(invoiceItem => {
            if (!String(invoiceItem.id).startsWith('custom-')) {
                $inventory.update(invItems => invItems.map(invItem => 
                    invItem.id === invoiceItem.id ? { ...invItem, quantity: invItem.quantity - invoiceItem.quantity } : invItem
                ));
            }
        });

        alert(`Invoice ${invoiceToSave.number} saved!`);
        currentInvoice = createNewInvoice();
    }

    function loadInvoice(invoiceId) {
        const invoiceToLoad = $invoices.find(inv => inv.id === invoiceId);
        if (invoiceToLoad) currentInvoice = JSON.parse(JSON.stringify(invoiceToLoad));
    }
    
    function printInvoice() { window.print(); }
</script>

<style>
    .invoice-preview { font-family: 'Arial', sans-serif; }
    @media print {
        body > :not(.printable-area) { display: none; }
        .printable-area {
            position: absolute; left: 0; top: 0; width: 100%;
        }
    }
</style>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6 no-print">
        <h1 class="text-4xl font-greycliffbold text-charcoal">Invoicing</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="no-print space-y-6">
            <div class="card bg-base-100 shadow-xl border"><div class="card-body p-6">
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
            </div></div>

            <div class="card bg-base-100 shadow-xl border"><div class="card-body p-6">
                <h2 class="card-title text-xl font-greycliffmed">Add From Inventory</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <select class="select select-bordered md:col-span-2" bind:value={selectedItemId}>
                        <option disabled selected value="">Select an item</option>
                        {#each $inventory as item}
                            <option value={item.id}>{item.name} (Stock: {item.quantity})</option>
                        {/each}
                    </select>
                    <input type="number" bind:value={selectedItemQty} min="1" class="input input-bordered">
                </div>
                <div class="card-actions justify-end mt-4"><button class="btn btn-secondary" on:click={handleAddItemFromInventory}>Add Item</button></div>
            </div></div>

            <div class="card bg-base-100 shadow-xl border"><div class="card-body p-6">
                <h2 class="card-title text-xl font-greycliffmed">Add Custom Item</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Item Name" class="input input-bordered" bind:value={customItem.name} />
                    <input type="number" placeholder="Quantity" class="input input-bordered" bind:value={customItem.quantity} min="1"/>
                    <input type="number" placeholder="Price" class="input input-bordered" bind:value={customItem.price} min="0" step="0.01" />
                </div>
                <div class="card-actions justify-end mt-4"><button class="btn btn-accent" on:click={handleAddCustomItem}>Add Custom Item</button></div>
            </div></div>

            <div class="mt-6 flex flex-wrap gap-4 justify-center">
                <button class="btn btn-success btn-wide" on:click={saveInvoice}>Save Invoice</button>
                <button class="btn btn-info btn-wide" on:click={printInvoice}>Print</button>
                <button class="btn btn-outline btn-wide" on:click={() => {currentInvoice = createNewInvoice()}}>New Invoice</button>
            </div>
        </div>

        <div class="printable-area">
            <div class="card w-full bg-white shadow-xl border"><div class="card-body p-8 invoice-preview text-sm text-gray-700">
                <div class="flex justify-between items-start">
                    <div><h2 class="text-2xl font-bold font-greycliffbold text-black">{$storeName || 'Your Company'}</h2></div>
                    <div class="text-right">
                        <h3 class="text-xl font-bold">INVOICE</h3>
                        <p class="text-gray-500">{currentInvoice.number}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-8">
                    <div>
                        <p class="font-bold">Bill To:</p>
                        <p>{currentInvoice.customerName || 'Customer Name'}</p>
                    </div>
                    <div class="text-right">
                        <p><span class="font-bold">Issue Date:</span> {dayjs(currentInvoice.issueDate).format('MMM D, YYYY')}</p>
                        <p><span class="font-bold">Due Date:</span> {dayjs(currentInvoice.dueDate).format('MMM D, YYYY')}</p>
                    </div>
                </div>
                <div class="overflow-x-auto mt-6">
                    <table class="table w-full">
                        <thead class="bg-gray-50"><tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th><th class="no-print"></th></tr></thead>
                        <tbody>
                            {#each currentInvoice.items as item (item.id)}
                            <tr>
                                <td>{item.name}</td><td class="text-center">{item.quantity}</td>
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
                <div class="flex justify-end mt-6"><div class="w-full max-w-xs text-right">
                    <div class="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                    <div class="flex justify-between mt-1"><span>Tax ({currentInvoice.taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>
                    <div class="divider my-1"></div>
                    <div class="flex justify-between font-bold text-lg text-black"><span>Total:</span><span>${total.toFixed(2)}</span></div>
                </div></div>
            </div></div>
        </div>
    </div>

    <div class="card w-full bg-base-100 shadow-xl border mt-8 no-print">
        <div class="card-body p-6">
            <h2 class="card-title text-xl font-greycliffmed">Saved Invoices</h2>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {#each $invoices as invoice (invoice.id)}
                        <tr class="hover">
                            <td>{invoice.number}</td><td>{invoice.customerName}</td>
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
