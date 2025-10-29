<script lang='ts'>
    import { createEventDispatcher, onMount } from 'svelte';
    import { inventory, invoices, storeName, publicKey, mints, customers } from '../stores.js';
    import dayjs from 'dayjs';
    import { browser } from '$app/environment';
    import { showToast } from '../toastStore.js';
    import jsPDF from 'jspdf';
    import html2canvas from 'html2canvas';
    import Fuse from 'fuse.js';

    export let invoice = null;

    const dispatch = createEventDispatcher();

    let currentInvoice = invoice ? JSON.parse(JSON.stringify(invoice)) : createNewInvoice();
    let selectedItemId = '';
	let selectedItemQty = 1;
    let customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
    let selectedCustomerId = invoice ? invoice.customerId : '';
    let customerSearch = '';
    let selectedItemWithVariants = null;

    let createQR, encodeURL, BigNumber, web3;
    let librariesLoaded = false;
    let isPaid = currentInvoice.status === 'Paid';
    
    onMount(async () => {
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
                if (browser) showToast("Error: Could not load payment libraries. Please refresh the page.", "error");
            }
        }
    });

    $: fuse = new Fuse($customers, { keys: ['name', 'email'], threshold: 0.3 });
    $: filteredCustomers = customerSearch ? fuse.search(customerSearch).map(result => result.item) : $customers;

    $: {
        if (selectedCustomerId) {
            const customer = $customers.find(c => c.id === selectedCustomerId);
            if (customer) {
                currentInvoice.customerName = customer.name;
            }
        }
    }

    $: subtotal = currentInvoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    $: taxAmount = currentInvoice.applyTax ? subtotal * (currentInvoice.taxRate / 100) : 0;
    $: total = isPaid ? 0 : subtotal + taxAmount;

    function createNewInvoice() {
        const nextInvoiceNumber = $invoices.length + 1;
        return {
            id: null, number: `INV-${String(nextInvoiceNumber).padStart(4, '0')}`,
            customerName: '', customerId: null, issueDate: dayjs().format('YYYY-MM-DD'),
            dueDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
            items: [], taxRate: 8.875, applyTax: true, status: 'Draft',
            paymentCurrency: 'USDC'
        };
    }

	function handleAddItemFromInventory() {
        const itemToAdd = $inventory.find(i => i.id === selectedItemId);
        if (!itemToAdd) { if (browser) showToast('Please select an item.', 'error'); return; }
        
        if (itemToAdd.type === 'variable' && itemToAdd.variants.length > 0) {
            selectedItemWithVariants = itemToAdd;
        } else {
            addItemToInvoice(itemToAdd, selectedItemQty);
        }

        selectedItemId = ''; 
        selectedItemQty = 1;
    }

    function handleSelectVariant(variant) {
        const itemWithVariant = {
            ...selectedItemWithVariants,
            price: variant.price,
            sku: variant.sku,
            name: `${selectedItemWithVariants.name} - ${variant.name}`,
            variantId: variant.id,
        };
        addItemToInvoice(itemWithVariant, selectedItemQty);
        selectedItemWithVariants = null;
    }
    
    function handleAddCustomItem() {
        const { name, quantity, price, currency } = customItem;
        if (name.trim() && quantity > 0 && price >= 0) {
            addItemToInvoice({ id: `custom-${Date.now()}`, name: name.trim(), price, currency }, quantity);
            customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
        } else {
            if (browser) showToast("Please provide a valid name, quantity, and price.", "error");
        }
    }

    function addItemToInvoice(item, quantity) {
        const uniqueId = item.variantId || item.id;
        const existingItem = currentInvoice.items.find(i => (i.variantId || i.id) === uniqueId);
        
        if (existingItem) existingItem.quantity += quantity;
        else currentInvoice.items.push({ ...item, quantity });
        
        currentInvoice.items = currentInvoice.items;
    }
    
    function removeItem(itemId) {
        currentInvoice.items = currentInvoice.items.filter(i => (i.variantId || i.id) !== itemId);
    }

    function saveInvoice() {
        if (isPaid) return;
        if (!currentInvoice.customerName.trim()) { if (browser) showToast('Please enter a customer name.', 'error'); return; }
        if (currentInvoice.items.length === 0) { if (browser) showToast('Please add at least one item.', 'error'); return; }

        if (selectedCustomerId) {
            currentInvoice.customerId = selectedCustomerId;
        } else if (currentInvoice.customerName.trim()) {
            const existingCustomer = $customers.find(c => c.name.toLowerCase() === currentInvoice.customerName.trim().toLowerCase());
            if (!existingCustomer) {
                const newCustomer = {
                    id: Date.now().toString(), name: currentInvoice.customerName.trim(),
                    email: '', phone: '', wallet: ''
                };
                $customers = [...$customers, newCustomer];
                currentInvoice.customerId = newCustomer.id;
            } else {
                currentInvoice.customerId = existingCustomer.id;
            }
        }

        const invoiceToSave = { ...currentInvoice, id: currentInvoice.id || Date.now(), status: 'Unpaid', total };
        const existingIndex = $invoices.findIndex(inv => inv.id === invoiceToSave.id);

        if (existingIndex > -1) $invoices[existingIndex] = invoiceToSave;
        else $invoices.push(invoiceToSave);
        $invoices = $invoices;

		if (browser) showToast(`Invoice ${invoiceToSave.number} saved!`, 'success');
        dispatch('close');
    }
    
    async function downloadPdf() {
        const invoiceElement = document.getElementById('invoice-preview');
        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${currentInvoice.number}.pdf`);
    }

    function generateQrCode() {
        if (isPaid) return;
        const qrCodeElement = document.getElementById('qr-code-invoice');
        if (!librariesLoaded) { 
            if (browser) showToast("Payment libraries are still loading. Please wait a moment and try again.", "error");
            return;
        }
        if (!qrCodeElement || total <= 0) return;
        const selectedToken = $mints.find(m => m.name === currentInvoice.paymentCurrency);
        if (!selectedToken) { 
            if (browser) showToast("Selected payment currency is invalid.", "error");
            return;
        }

        const reference = new web3.Keypair().publicKey;
        currentInvoice.reference = reference.toBase58();
        const urlParams: any = {
            recipient: new web3.PublicKey($publicKey),
            amount: new BigNumber(total),
            reference,
            label: `Invoice ${currentInvoice.number}`,
            message: `Payment for ${currentInvoice.customerName}`,
            memo: `Invoice #${currentInvoice.number}`
        };
        if (selectedToken.name !== 'SOL') {
            urlParams.splToken = new web3.PublicKey(selectedToken.mint);
        }

        const url = encodeURL(urlParams);
        const qr = createQR(url, 200, 'transparent');
        qrCodeElement.innerHTML = '';
        qr.append(qrCodeElement);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-7xl">
        <h3 class="font-bold text-lg">
            {invoice ? 'View' : 'Create'} Invoice
            {#if isPaid}
                <span class="badge badge-success ml-4">PAID</span>
            {/if}
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
            <div class="space-y-6">
                 <div id="invoice-details-card" class="card bg-base-200 shadow-xl border"><div class="card-body p-6">
                    <h2 class="card-title text-xl font-greycliffmed">Invoice Details</h2>
                    <input type="text" placeholder="Search for a customer..." class="input input-bordered" bind:value={customerSearch} disabled={isPaid} />
                    <select class="select select-bordered" bind:value={selectedCustomerId} disabled={isPaid}>
                        <option value="" disabled>Select a customer</option>
                        {#each filteredCustomers as customer (customer.id)}
                            <option value={customer.id}>{customer.name}</option>
                        {/each}
                    </select>
                    <input type="text" placeholder="Or enter new customer name" class="input input-bordered" bind:value={currentInvoice.customerName} disabled={isPaid || selectedCustomerId} />
                    <div class="grid grid-cols-2 gap-4 mt-2">
                        <input type="date" class="input input-bordered" bind:value={currentInvoice.issueDate} disabled={isPaid} />
                        <input type="date" class="input input-bordered" bind:value={currentInvoice.dueDate} disabled={isPaid} />
                    </div>
                    <div class="form-control mt-2">
                        <label class="label cursor-pointer"><span class="label-text">Apply Tax ({currentInvoice.taxRate}%)</span><input type="checkbox" class="toggle toggle-primary" bind:checked={currentInvoice.applyTax} disabled={isPaid} /></label>
                    </div>
                    <div class="form-control">
                        <label class="label" for="payment-currency"><span class="label-text">Payment Currency</span></label>
                        <select class="select select-bordered" id="payment-currency" bind:value={currentInvoice.paymentCurrency} disabled={isPaid}>
                            {#each $mints as mint}<option value={mint.name}>{mint.name}</option>{/each}
                        </select>
                    </div>
                </div></div>
                <div class="card bg-base-200 shadow-xl border"><div class="card-body p-6">
                    <h2 id="add-from-inventory-title" class="card-title text-xl font-greycliffmed">Add From Inventory</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <select class="select select-bordered md:col-span-2" bind:value={selectedItemId} disabled={isPaid}><option disabled selected value="">Select an item</option>{#each $inventory as item}<option value={item.id}>{item.name} (Stock: {item.quantity})</option>{/each}</select>
                        <input type="number" bind:value={selectedItemQty} min="1" class="input input-bordered" disabled={isPaid}>
                    </div>
                    <div class="card-actions justify-end mt-4"><button type="button" class="btn btn-secondary" on:click={handleAddItemFromInventory} disabled={isPaid}>Add Item</button></div>
                </div></div>
                <div class="card bg-base-200 shadow-xl border"><div class="card-body p-6">
                    <h2 class="card-title text-xl font-greycliffmed">Add Custom Item</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" placeholder="Item Name" class="input input-bordered md:col-span-2" bind:value={customItem.name} disabled={isPaid} />
                        <input type="number" placeholder="Qty" class="input input-bordered" bind:value={customItem.quantity} min="1" disabled={isPaid}/>
                        <input type="number" placeholder="Price" class="input input-bordered" bind:value={customItem.price} min="0" step="0.01" disabled={isPaid} />
                    </div>
                    <div class="card-actions justify-end mt-4"><button type="button" class="btn btn-accent" on:click={handleAddCustomItem} disabled={isPaid}>Add Custom Item</button></div>
                </div></div>
            </div>

            <div class="printable-area">
                <div id="invoice-preview" class="card w-full bg-white shadow-xl border"><div class="card-body p-8 invoice-preview text-sm">
                    <div class="flex justify-between items-start">
                        <div><h2 class="text-2xl font-bold font-greycliffbold">{$storeName || 'Your Company'}</h2></div>
                        <div class="text-right"><h3 class="text-xl font-bold">INVOICE</h3><p class="opacity-70">{currentInvoice.number}</p></div>
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
                        <table class="table w-full"><thead class="bg-gray-50 text-gray-700"><tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th><th class="no-print"></th></tr></thead>
                        <tbody>
                            {#each currentInvoice.items as item (item.variantId || item.id)}<tr><td>{item.name}</td><td class="text-center">{item.quantity}</td><td class="text-right">${(item.price || 0).toFixed(2)}</td><td class="text-right">${(item.quantity * (item.price || 0)).toFixed(2)}</td><td class="no-print text-center p-1"><button type="button" class="btn btn-ghost btn-xs" on:click={() => removeItem(item.variantId || item.id)} disabled={isPaid}>✕</button></td></tr>{/each}
                            {#if currentInvoice.items.length === 0}<tr><td colspan="5" class="text-center opacity-70 py-4">No items added yet.</td></tr>{/if}
                        </tbody>
                        </table>
                    </div>
                    <div class="flex justify-between items-end mt-6">
                        <div class="text-center">
                            {#if !isPaid}
                            <div id="qr-code-invoice" class="mb-2 min-h-[200px] min-w-[200px] flex items-center justify-center text-sm opacity-70">Click "Pay" to generate code.</div>
                            <button type="button" class="btn btn-primary btn-sm no-print" on:click={generateQrCode} disabled={!librariesLoaded}>Pay with Solana</button>
                            {/if}
                        </div>
                        <div class="w-full max-w-xs text-right">
                            <div class="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                            {#if currentInvoice.applyTax}<div class="flex justify-between mt-1"><span>Tax ({currentInvoice.taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>{/if}
                            <div class="divider my-1"></div>
                            <div class="flex justify-between font-bold text-lg"><span>Total ({currentInvoice.paymentCurrency}):</span><span>${total.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div></div>
            </div>
        </div>
        <div class="modal-action">
            <button type="button" class="btn" on:click={() => dispatch('close')}>Close</button>
            <button type="button" class="btn btn-info" on:click={downloadPdf}>Download PDF</button>
            <button type="button" class="btn btn-success" on:click={saveInvoice} disabled={isPaid}>Save Invoice</button>
        </div>
    </div>
</div>
