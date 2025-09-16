<script lang='ts'>
    import { inventory, invoices, storeName, publicKey, mints, customers } from '../stores.js';
    import dayjs from 'dayjs';
	import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
	import { showToast } from '../toastStore.js';
    import jsPDF from 'jspdf';
    import html2canvas from 'html2canvas';
    import { logHistory } from '../../utils/inventory.js';

	// --- State for the invoice form ---
    let currentInvoice = createNewInvoice();
    let selectedItemId = '';
	let selectedItemQty = 1;
    let customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
	let selectedCustomerId = '';

	// --- Module variables for dynamically imported libraries ---
    let createQR, encodeURL, BigNumber, web3, findReference, FindReferenceError;
	let librariesLoaded = false;
    
    onMount(async () => {
        if (browser && !$publicKey) {
            showToast("Please set your merchant wallet address first.", "error");
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
		        findReference = solanaPay.findReference;
                FindReferenceError = solanaPay.FindReferenceError;
                encodeURL = solanaPay.encodeURL;
                web3 = solanaWeb3;
                BigNumber = BigNumberLib.default;
                librariesLoaded = true;
 
				await checkInvoicePayments();
            } catch (e) {
                console.error("Failed to load Solana libraries", e);
      
                if (browser) showToast("Error: Could not load payment libraries. Please refresh the page.", "error");
            }
        }
    });

    $: {
        if (selectedCustomerId) {
            const customer = $customers.find(c => c.id === selectedCustomerId);
            if (customer) {
                currentInvoice.customerName = customer.name;
            }
        }
    }

    // --- Reactive calculations ---
    $: subtotal = currentInvoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    $: taxAmount = currentInvoice.applyTax ? subtotal * (currentInvoice.taxRate / 100) : 0;
    $: total = subtotal + taxAmount;

    // --- Functions ---
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
        if (!itemToAdd) { if (browser) showToast('Please select an item.', 'error'); return;
        }
        addItemToInvoice(itemToAdd, selectedItemQty);
        selectedItemId = ''; selectedItemQty = 1;
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
        const existingItem = currentInvoice.items.find(i => i.id === item.id);
		if (existingItem) existingItem.quantity += quantity;
        else currentInvoice.items.push({ ...item, quantity });
        currentInvoice.items = currentInvoice.items;
	}
    
    function removeItem(itemId) {
        currentInvoice.items = currentInvoice.items.filter(i => i.id !== itemId);
	}

    function saveInvoice() {
        if (!currentInvoice.customerName.trim()) { if (browser) showToast('Please enter a customer name.', 'error'); return; }
        if (currentInvoice.items.length === 0) { if (browser) showToast('Please add at least one item.', 'error'); return; }

        if (selectedCustomerId) {
            currentInvoice.customerId = selectedCustomerId;
        } else if (currentInvoice.customerName.trim()) {
            const existingCustomer = $customers.find(c => c.name.toLowerCase() === currentInvoice.customerName.trim().toLowerCase());
            if (!existingCustomer) {
                const newCustomer = {
                    id: Date.now().toString(),
                    name: currentInvoice.customerName.trim(),
                    email: '',
                    phone: '',
                    wallet: ''
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
        currentInvoice = createNewInvoice();
        selectedCustomerId = '';
    }

    function loadInvoice(invoiceId) {
        const invoiceToLoad = $invoices.find(inv => inv.id === invoiceId);
		if (invoiceToLoad) {
            currentInvoice = JSON.parse(JSON.stringify(invoiceToLoad));
            selectedCustomerId = invoiceToLoad.customerId;
        }
    }

    function removeInvoice(invoiceId) {
        if (browser && confirm("Are you sure you want to permanently delete this invoice?")) {
            $invoices = $invoices.filter(inv => inv.id !== invoiceId);
            if (currentInvoice.id === invoiceId) {
                currentInvoice = createNewInvoice();
			}
        }
    }
    
    function printInvoice() { if (browser) window.print(); }

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

    function processPaidInvoice(invoice) {
        invoice.status = 'Paid';
        showToast(`Invoice ${invoice.number} was paid!`, 'success');
        
        invoice.items.forEach(item => {
            if (!String(item.id).startsWith('custom-')) {
                inventory.update(invs => {
                    return invs.map(i => {
                        if (i.id === item.id) {
                            const newQuantity = i.quantity - item.quantity;
                            logHistory(item.id, `Sale (Invoice ${invoice.number})`, `-${item.quantity}`, newQuantity);
                            return { ...i, quantity: newQuantity };
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

    function generateQrCode() {
        const qrCodeElement = document.getElementById('qr-code-invoice');
		if (!librariesLoaded) { 
            if (browser) showToast("Payment libraries are still loading. Please wait a moment and try again.", 'error');
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

<style>
    .invoice-preview { font-family: 'Arial', sans-serif; }
    @media print {
        body * { visibility: hidden; }
        .printable-area, .printable-area * { visibility: visible; }
        .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none; }
    }
</style>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6 no-print">
        <h1 class="text-4xl font-greycliffbold">Invoicing</h1>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="no-print space-y-6">
            <div class="card bg-base-100 shadow-xl border"><div class="card-body p-6">
                <h2 class="card-title text-xl font-greycliffmed">Invoice Details</h2>
                <select class="select select-bordered" bind:value={selectedCustomerId}>
                    <option value="" disabled>Select a customer</option>
                    {#each $customers as customer (customer.id)}
                        <option value={customer.id}>{customer.name}</option>
                    {/each}
                </select>
                <input type="text" placeholder="Or enter new customer name" class="input input-bordered" bind:value={currentInvoice.customerName} disabled={selectedCustomerId} />
                <div class="grid grid-cols-2 gap-4 mt-2">
                    <input type="date" class="input input-bordered" bind:value={currentInvoice.issueDate} />
                    <input type="date" class="input input-bordered" bind:value={currentInvoice.dueDate} />
				</div>
                <div class="form-control mt-2">
                    <label class="label cursor-pointer"><span class="label-text">Apply Tax ({currentInvoice.taxRate}%)</span><input type="checkbox" class="toggle toggle-primary" bind:checked={currentInvoice.applyTax} /></label>
                </div>
                <div class="form-control">
					<label class="label" for="payment-currency"><span class="label-text">Payment Currency</span></label>
                    <select class="select select-bordered" id="payment-currency" bind:value={currentInvoice.paymentCurrency}>
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
                <button class="btn btn-primary btn-wide" on:click={downloadPdf}>Download PDF</button>
                <button class="btn btn-outline btn-wide" on:click={() => {currentInvoice = createNewInvoice()}}>New Invoice</button>
            </div>
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
                        {#each currentInvoice.items as item (item.id)}<tr><td>{item.name}</td><td class="text-center">{item.quantity}</td><td class="text-right">${(item.price || 0).toFixed(2)}</td><td class="text-right">${(item.quantity * (item.price || 0)).toFixed(2)}</td><td class="no-print text-center p-1"><button class="btn btn-ghost btn-xs" on:click={() => removeItem(item.id)}>✕</button></td></tr>{/each}
                        {#if currentInvoice.items.length === 0}<tr><td colspan="5" class="text-center opacity-70 py-4">No items added yet.</td></tr>{/if}
                    </tbody>
                    </table>
                </div>
                <div class="flex justify-between items-end mt-6">
					<div class="text-center">
                        <div id="qr-code-invoice" class="mb-2 min-h-[200px] min-w-[200px] flex items-center justify-center text-sm opacity-70">Click "Pay" to generate code.</div>
                        <button class="btn btn-primary btn-sm no-print" on:click={generateQrCode} disabled={!librariesLoaded}>Pay with Solana</button>
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
							<button class="btn btn-xs btn-outline btn-success" on:click={() => markAsPaid(invoice.id)}>Mark Paid</button>
                            <button class="btn btn-xs btn-outline btn-error" on:click={() => removeInvoice(invoice.id)}>Delete</button>
                        </td>
					</tr>
                    {/each}
                    {#if $invoices.length === 0}<tr><td colspan="6" class="text-center opacity-70 py-4">No saved invoices.</td></tr>{/if}
                </tbody>
            </table>
		</div>
    </div></div>
</div>
