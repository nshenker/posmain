<script lang='ts'>
    import { inventory, invoices, storeName, publicKey, mints } from '../stores.js';
    import dayjs from 'dayjs';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    // --- State for the invoice form ---
    let currentInvoice = createNewInvoice();
    let selectedItemId = '';
    let selectedItemQty = 1;
    let customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
    
    // --- Module variables for dynamically imported libraries ---
    let createQR, encodeURL, BigNumber, web3;
    let librariesLoaded = false;
    
    onMount(async () => {
        if (browser && !$publicKey) {
            alert("Please set your merchant wallet address first.");
            goto('/');
            return;
        }

        // Dynamically import libraries only on the client-side
        if (browser) {
            try {
                const solanaPay = await import('@solana/pay');
                const solanaWeb3 = await import('@solana/web3.js');
                const BigNumberLib = await import('bignumber.js');

                createQR = solanaPay.createQR;
                encodeURL = solanaPay.encodeURL;
                web3 = solanaWeb3;
                BigNumber = BigNumberLib.default;
                librariesLoaded = true;
            } catch (e) {
                console.error("Failed to load Solana libraries", e);
                if (browser) alert("Error: Could not load payment libraries. Please refresh the page.");
            }
        }
    });

    // --- Reactive calculations ---
    $: subtotal = currentInvoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    $: taxAmount = currentInvoice.applyTax ? subtotal * (currentInvoice.taxRate / 100) : 0;
    $: total = subtotal + taxAmount;

    // --- Functions ---
    function createNewInvoice() {
        const nextInvoiceNumber = $invoices.length + 1;
        return {
            id: null, number: `INV-${String(nextInvoiceNumber).padStart(4, '0')}`,
            customerName: '', issueDate: dayjs().format('YYYY-MM-DD'),
            dueDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
            items: [], taxRate: 8.875, applyTax: true, status: 'Draft',
            paymentCurrency: 'USDC'
        };
    }

    function handleAddItemFromInventory() {
        const itemToAdd = $inventory.find(i => i.id === selectedItemId);
        if (!itemToAdd) { if (browser) alert('Please select an item.'); return; }
        addItemToInvoice(itemToAdd, selectedItemQty);
        selectedItemId = ''; selectedItemQty = 1;
    }
    
    function handleAddCustomItem() {
        const { name, quantity, price, currency } = customItem;
        if (name.trim() && quantity > 0 && price >= 0) {
            addItemToInvoice({ id: `custom-${Date.now()}`, name: name.trim(), price, currency }, quantity);
            customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
        } else {
            if (browser) alert("Please provide a valid name, quantity, and price.");
        }
    }

    function addItemToInvoice(item, quantity) {
        const existingItem = currentInvoice.items.find(i => i.id === item.id);
        if (existingItem) existingItem.quantity += quantity;
        else currentInvoice.items.push({ ...item, quantity });
        currentInvoice.items = currentInvoice.items;
    }
    
    function removeItem(itemId) {
        currentInvoice.items = currentInvoice.items.filter(i => i.id !== itemId);
    }

    function saveInvoice() {
        if (!currentInvoice.customerName.trim()) { if (browser) alert('Please enter a customer name.'); return; }
        if (currentInvoice.items.length === 0) { if (browser) alert('Please add at least one item.'); return; }

        const invoiceToSave = { ...currentInvoice, id: currentInvoice.id || Date.now(), status: 'Saved', total };
        const existingIndex = $invoices.findIndex(inv => inv.id === invoiceToSave.id);

        if (existingIndex > -1) $invoices[existingIndex] = invoiceToSave;
        else $invoices.push(invoiceToSave);
        $invoices = $invoices;

        invoiceToSave.items.forEach(item => {
            if (!String(item.id).startsWith('custom-')) {
                $inventory.update(invs => invs.map(i => i.id === item.id ? { ...i, quantity: i.quantity - item.quantity } : i));
            }
        });
        
        if (browser) alert(`Invoice ${invoiceToSave.number} saved!`);
        currentInvoice = createNewInvoice();
    }

    function loadInvoice(invoiceId) {
        const invoiceToLoad = $invoices.find(inv => inv.id === invoiceId);
        if (invoiceToLoad) currentInvoice = JSON.parse(JSON.stringify(invoiceToLoad));
    }

    function removeInvoice(invoiceId) {
        if (browser && confirm("Are you sure you want to permanently delete this invoice?")) {
            $invoices = $invoices.filter(inv => inv.id !== invoiceId);
            // If the deleted invoice was being viewed, reset the form
            if (currentInvoice.id === invoiceId) {
                currentInvoice = createNewInvoice();
            }
        }
    }
    
    function printInvoice() { if (browser) window.print(); }

    function generateQrCode() {
        const qrCodeElement = document.getElementById('qr-code-invoice');
        if (!librariesLoaded) { if (browser) alert("Payment libraries are still loading. Please wait a moment and try again."); return; }
        if (!qrCodeElement || total <= 0) return;

        const selectedToken = $mints.find(m => m.name === currentInvoice.paymentCurrency);
        if (!selectedToken) { if (browser) alert("Selected payment currency is invalid."); return; }

        const url = encodeURL({
            recipient: new web3.PublicKey($publicKey),
            amount: new BigNumber(total),
            splToken: new web3.PublicKey(selectedToken.mint),
            reference: new web3.PublicKey(web3.Keypair.generate().publicKey),
            label: `Invoice ${currentInvoice.number}`,
            message: `Payment for ${currentInvoice.customerName}`,
            memo: `Invoice #${currentInvoice.number}`
        });
        
        const qr = createQR(url, 200, 'transparent');
        qrCodeElement.innerHTML = '';
        qr.append(qrCodeElement);
    }
</script>

<style>
    .invoice-preview { font-family: 'Arial', sans-serif; }
    @media print {
        body > :not(.printable-area) { display: none; }
        .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none; }
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
                <input type="text" placeholder="Customer Name" class="input input-bordered" bind:value={currentInvoice.customerName} />
                <div class="grid grid-cols-2 gap-4 mt-2">
                    <input type="date" class="input input-bordered" bind:value={currentInvoice.issueDate} />
                    <input type="date" class="input input-bordered" bind:value={currentInvoice.dueDate} />
                </div>
                <div class="form-control mt-2">
                    <label class="label cursor-pointer"><span class="label-text">Apply Tax ({currentInvoice.taxRate}%)</span><input type="checkbox" class="toggle toggle-primary" bind:checked={currentInvoice.applyTax} /></label>
                </div>
                <div class="form-control">
                    <label class="label"><span class="label-text">Payment Currency</span></label>
                    <select class="select select-bordered" bind:value={currentInvoice.paymentCurrency}>
                        {#each $mints as mint}<option value={mint.name}>{mint.name}</option>{/each}
                    </select>
                </div>
            </div></div>
            <div class="card bg-base-100 shadow-xl border"><div class="card-body p-6">
                <h2 class="card-title text-xl font-greycliffmed">Add From Inventory</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <select class="select select-bordered md:col-span-2" bind:value={selectedItemId}><option disabled selected value="">Select an item</option>{#each $inventory as item}<option value={item.id}>{item.name} (Stock: {item.quantity})</option>{/each}</select>
                    <input type="number" bind:value={selectedItemQty} min="1" class="input input-bordered">
                </div>
                <div class="card-actions justify-end mt-4"><button class="btn btn-secondary" on:click={handleAddItemFromInventory}>Add Item</button></div>
            </div></div>
            <div class="card bg-base-100 shadow-xl border"><div class="card-body p-6">
                <h2 class="card-title text-xl font-greycliffmed">Add Custom Item</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Item Name" class="input input-bordered md:col-span-2" bind:value={customItem.name} />
                    <input type="number" placeholder="Qty" class="input input-bordered" bind:value={customItem.quantity} min="1"/>
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
                    <div class="text-right"><h3 class="text-xl font-bold">INVOICE</h3><p class="text-gray-500">{currentInvoice.number}</p></div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-8">
                    <div><p class="font-bold">Bill To:</p><p>{currentInvoice.customerName || 'Customer Name'}</p></div>
                    <div class="text-right"><p><span class="font-bold">Issue Date:</span> {dayjs(currentInvoice.issueDate).format('MMM D, YYYY')}</p><p><span class="font-bold">Due Date:</span> {dayjs(currentInvoice.dueDate).format('MMM D, YYYY')}</p></div>
                </div>
                <div class="overflow-x-auto mt-6">
                    <table class="table w-full"><thead class="bg-gray-50"><tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th><th class="no-print"></th></tr></thead>
                        <tbody>
                            {#each currentInvoice.items as item (item.id)}<tr><td>{item.name}</td><td class="text-center">{item.quantity}</td><td class="text-right">${(item.price || 0).toFixed(2)}</td><td class="text-right">${(item.quantity * (item.price || 0)).toFixed(2)}</td><td class="no-print text-center p-1"><button class="btn btn-ghost btn-xs" on:click={() => removeItem(item.id)}>✕</button></td></tr>{/each}
                            {#if currentInvoice.items.length === 0}<tr><td colspan="5" class="text-center text-gray-400 py-4">No items added yet.</td></tr>{/if}
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-between items-end mt-6">
                    <div class="text-center no-print">
                        <div id="qr-code-invoice" class="mb-2 min-h-[200px] min-w-[200px] flex items-center justify-center text-gray-400 text-sm">Click "Pay" to generate code.</div>
                        <button class="btn btn-primary btn-sm" on:click={generateQrCode} disabled={!librariesLoaded}>Pay with Solana</button>
                    </div>
                    <div class="w-full max-w-xs text-right">
                        <div class="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                        {#if currentInvoice.applyTax}<div class="flex justify-between mt-1"><span>Tax ({currentInvoice.taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>{/if}
                        <div class="divider my-1"></div>
                        <div class="flex justify-between font-bold text-lg text-black"><span>Total ({currentInvoice.paymentCurrency}):</span><span>${total.toFixed(2)}</span></div>
                    </div>
                </div>
            </div></div>
        </div>
    </div>
    <div class="card w-full bg-base-100 shadow-xl border mt-8 no-print"><div class="card-body p-6">
        <h2 class="card-title text-xl font-greycliffmed">Saved Invoices</h2>
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
                            <button class="btn btn-xs btn-outline" on:click={() => loadInvoice(invoice.id)}>View</button>
                            <button class="btn btn-xs btn-outline btn-error" on:click={() => removeInvoice(invoice.id)}>Delete</button>
                        </td>
                    </tr>
                    {/each}
                    {#if $invoices.length === 0}<tr><td colspan="6" class="text-center text-gray-400 py-4">No saved invoices.</td></tr>{/if}
                </tbody>
            </table>
        </div>
    </div></div>
</div>
