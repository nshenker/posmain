<script lang='ts'>
    import { createEventDispatcher, onMount } from 'svelte';
    import { inventory, invoices, storeName, publicKey, mints, customers, businessAddress } from '../stores.js';
    import dayjs from 'dayjs';
    import { browser } from '$app/environment';
    import { showToast } from '../toastStore.js';
    
    import { triggerInvoicePrint } from '../printStore.js';
    
    import Fuse from 'fuse.js';
    import { get } from 'svelte/store';

    //
    // START: Libraries for QR Code & Payment Link Generation
    //
    let createQR, encodeURL, BigNumber, web3;
    let librariesLoaded = false;
    
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
   
                console.error("Failed to load Solana libraries for modal", e);
                if (browser) showToast("Error: Could not load payment libraries. Please refresh the page.", "error");
            }
        }
    });
    //
    // END: Libraries for QR Code & Payment Link Generation
    //

    export let invoice = null;
    const dispatch = createEventDispatcher();

    let currentInvoice = invoice ?
JSON.parse(JSON.stringify(invoice)) : createNewInvoice();
    let selectedItemId = '';
	let selectedItemQty = 1;
    let customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
    let selectedCustomerId = invoice ?
invoice.customerId : '';
    let customerSearch = '';
    let selectedItemWithVariants = null;
    
    let isPaid = currentInvoice.status === 'Paid';
    let isPrinting = false; // Added loading state for print button
    
    $: fuse = new Fuse($customers, { keys: ['name', 'email'], threshold: 0.3 });
    $: filteredCustomers = customerSearch ?
fuse.search(customerSearch).map(result => result.item) : $customers;

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
    $: total = isPaid ?
0 : subtotal + taxAmount;

    // REACTIVE STATE: The current currency of the entire invoice, derived from the first item
    $: invoiceCurrency = currentInvoice.paymentCurrency || null;

    // REACTIVE SIDE-EFFECT: Update customItem currency if the invoice currency is set
    $: if (invoiceCurrency && customItem.currency !== invoiceCurrency) {
        customItem.currency = invoiceCurrency;
    }

    // REACTIVE SIDE-EFFECT: Automatically generate QR code preview on load if conditions are met
    $: if (librariesLoaded && !isPaid && total > 0 && (currentInvoice.reference || currentInvoice.items.length > 0)) {
        generateQrCodePreview();
    }


    function createNewInvoice() {
        const nextInvoiceNumber = $invoices.length + 1;
return {
            id: null, 
            number: `INV-${String(nextInvoiceNumber).padStart(4, '0')}`,
            customerName: '', 
            customerId: null, 
            issueDate: dayjs().format('YYYY-MM-DD'),
            dueDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
            items: [], 
  
            taxRate: 8.875, 
            applyTax: true, 
            status: 'Draft',
            paymentCurrency: null, 
            reference: null,
            txid: null,
     
            txnId: null,
        };
}

    // --- SHARED FUNCTION: Generate the Solana Pay URL and return QR code object or null ---
    function generateSolanaPayUrl() {
        if (!librariesLoaded || !currentInvoice.paymentCurrency || total <= 0) return null;
        
        // Ensure reference exists in currentInvoice state
        if (!currentInvoice.reference) {
            const reference = new web3.Keypair().publicKey;
            currentInvoice.reference = reference.toBase58();
            // Critical: Force update of local state object so 'Save Invoice' picks up the change
            currentInvoice = { ...currentInvoice }; 
        }

        const selectedToken = get(mints).find(m => m.name === currentInvoice.paymentCurrency);
        if (!selectedToken) { 
            if (browser) showToast("Selected payment currency is invalid.", "error");
            return null;
        }

        const urlParams: any = {
            recipient: new web3.PublicKey(get(publicKey)),
            amount: new BigNumber(total),
            reference: new web3.PublicKey(currentInvoice.reference),
            label: `Invoice ${currentInvoice.number}`,
            message: `Payment for ${currentInvoice.customerName}`,
            memo: `Invoice #${currentInvoice.number}`
        };
        if (selectedToken.name !== 'SOL') {
            urlParams.splToken = new web3.PublicKey(selectedToken.mint);
        }

        return encodeURL(urlParams);
    }
    
    // --- SHARED FUNCTION: Generate QR Code for Modal Display ---
    function generateQrCodePreview() {
        if (isPaid) return;
        const qrCodeElement = document.getElementById('qr-code-invoice');
        if (!qrCodeElement) return;

        const url = generateSolanaPayUrl();
        if (!url) {
            qrCodeElement.innerHTML = 'Scan code not available.';
            return;
        }

        const qr = createQR(url, 200, 'transparent');
        qrCodeElement.innerHTML = '';
        qr.append(qrCodeElement);
    }

    /**
     * Helper function to generate the Base64 QR code string for printing.
     * NOTE: This is no longer used for printing past invoices, but kept for future proofing.
     */
    async function getQrCodeBase64(): Promise<string | null> {
        const url = generateSolanaPayUrl();
        if (!url) return null;
        
        // Use a temporary canvas for immediate rendering
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 150;
        tempCanvas.height = 150;
        
        const qr = createQR(url, 150, 'transparent'); 
        
        document.body.appendChild(tempCanvas);
        qr.append(tempCanvas);
        
        // Wait for the drawing to complete
        await new Promise(r => setTimeout(r, 100)); 

        const dataUrl = tempCanvas.toDataURL('image/png');
        
        tempCanvas.remove();
        
        return dataUrl;
    }


    // --- MODIFIED FUNCTION: Print Invoice (retained, but button removed) ---
    async function printInvoice() {
        if (typeof window === 'undefined') return;
        
        const isUnpaid = !isPaid && currentInvoice.paymentCurrency && total > 0;
        let solanaPayUrl = null;
        
        if (isUnpaid) {
            isPrinting = true;
            showToast("Generating QR code for printing...", "info");
            solanaPayUrl = generateSolanaPayUrl();
            isPrinting = false;

            if (!solanaPayUrl) {
                showToast("Could not generate QR code for printing.", "error");
                return;
            }
        }

        const finalInvoice = { 
            ...currentInvoice, 
            total: subtotal + taxAmount,
        };

        // Pass the generated URL string (or null) to the printable component
        triggerInvoicePrint(
            finalInvoice, 
            get(storeName), 
            get(businessAddress),
            get(publicKey), 
            get(mints),      
            solanaPayUrl // PASS THE READY URL STRING
        );
    }
    // --- END MODIFIED FUNCTION: Print Invoice ---

	function handleAddItemFromInventory() {
        const itemToAdd = $inventory.find(i => i.id === selectedItemId);
if (!itemToAdd) { if (browser) showToast('Please select an item.', 'error'); return;
}
        
        // FIX: Check currency compatibility before adding
        if (currentInvoice.items.length > 0 && currentInvoice.paymentCurrency && itemToAdd.currency !== currentInvoice.paymentCurrency) {
            if (browser) showToast(`Inventory item currency must match existing invoice currency (${currentInvoice.paymentCurrency}).`, 'error');
            return;
        }

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
            // Currency is implicitly inherited from parent, but explicitly checked/set in addItemToInvoice
        };
        
        // FIX: Check currency compatibility for variant before adding
        if (currentInvoice.items.length > 0 && currentInvoice.paymentCurrency && selectedItemWithVariants.currency !== currentInvoice.paymentCurrency) {
            if (browser) showToast(`Variant currency must match existing invoice currency (${currentInvoice.paymentCurrency}).`, 'error');
            selectedItemWithVariants = null; // Close the modal
            return;
        }
        
addItemToInvoice(itemWithVariant, selectedItemQty);
        selectedItemWithVariants = null;
    }
    
    function handleAddCustomItem() {
        const { name, quantity, price, currency } = customItem;
        
if (name.trim() && quantity > 0 && price >= 0) {
    
            // FIX: Check custom item currency against existing items
            if (currentInvoice.items.length > 0 && currentInvoice.paymentCurrency && currency !== currentInvoice.paymentCurrency) {
                if (browser) showToast(`Custom item currency must match existing items' currency (${currentInvoice.paymentCurrency}).`, 'error');
                return;
            }

            addItemToInvoice({ id: `custom-${Date.now()}`, name: name.trim(), price, currency }, quantity);
customItem = { name: '', quantity: 1, price: null, currency: 'USDC' };
} else {
            if (browser) showToast("Please provide a valid name, quantity, and price.", "error");
}
    }

    function addItemToInvoice(item, quantity) {
        
        // FIX: Set invoice currency upon adding the very first item
        if (!currentInvoice.paymentCurrency) {
            currentInvoice.paymentCurrency = item.currency || 'USDC'; 
            currentInvoice = {...currentInvoice}; // Trigger reactivity for currency change
        }

        const uniqueId = item.variantId ||
item.id;
        const existingItem = currentInvoice.items.find(i => (i.variantId || i.id) === uniqueId);
        
        if (existingItem) existingItem.quantity += quantity;
else currentInvoice.items.push({ ...item, quantity, currency: item.currency }); // Ensure currency is saved per item
        
        currentInvoice.items = currentInvoice.items;
    }
    
    function removeItem(itemId) {
        currentInvoice.items = currentInvoice.items.filter(i => (i.variantId || i.id) !== itemId);
        
        // FIX: If the cart is emptied, reset the invoice currency
        if (currentInvoice.items.length === 0) {
            currentInvoice.paymentCurrency = null;
            currentInvoice = {...currentInvoice};
        }
    }

    function saveInvoice() {
        if (isPaid) return;
if (!currentInvoice.customerName.trim()) { if (browser) showToast('Please enter a customer name.', 'error'); return;
}
        if (currentInvoice.items.length === 0) { if (browser) showToast('Please add at least one item.', 'error');
return; }
        
        // FIX: Ensure currency is set before saving (should be guaranteed by checks)
        if (!currentInvoice.paymentCurrency) {
             if (browser) showToast('Invoice currency is missing. Please add at least one item.', 'error');
             return;
        }

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

        const invoiceToSave = { ...currentInvoice, id: currentInvoice.id ||
Date.now(), status: 'Unpaid', total };
        const existingIndex = $invoices.findIndex(inv => inv.id === invoiceToSave.id);

        if (existingIndex > -1) $invoices[existingIndex] = invoiceToSave;
else $invoices.push(invoiceToSave);
        $invoices = $invoices;

		if (browser) showToast(`Invoice ${invoiceToSave.number} saved!`, 'success');
        dispatch('close');
}
</script>

{#if selectedItemWithVariants}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Select Variant for {selectedItemWithVariants.name}</h3>
            <div class="py-4">
                <div class="overflow-x-auto">
                    <table class="table w-full">

           
           <tbody>
                            {#each selectedItemWithVariants.variants as variant}
                                <tr class="hover">
                       
                                    <td>{variant.name}</td>
                                    <td class="text-right font-mono">{(variant.price || 0).toFixed(2)}</td>
                                    <td class="text-center">
          
                                        <button class="btn btn-xs btn-outline btn-success" on:click={() => handleSelectVariant(variant)} disabled={variant.quantity <= 0}>
                                            {#if variant.quantity > 0}Add{:else}Out of Stock{/if}
           
                                        </button>
                                    </td>
                                </tr>
   
                          {/each}
                        </tbody>
                    </table>
                </div>
            </div>
   
          <div class="modal-action">
                <button class="btn" on:click={() => selectedItemWithVariants = null}>Back</button>
            </div>
        </div>
    </div>
{/if}


<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-7xl">
        <h3 class="font-bold text-lg">
            {invoice ?
'View' : 'Create'} Invoice
            {#if isPaid}
                <span class="badge badge-success ml-4">PAID</span>
            {/if}
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
            <div class="space-y-6">
                 <div id="invoice-details-card" 
class="card bg-base-200 shadow-xl border"><div class="card-body p-6">
                    <h2 class="card-title text-xl font-greycliffmed">Invoice Details</h2>
                    <input type="text" placeholder="Search for a customer..." class="input input-bordered" bind:value={customerSearch} disabled={isPaid} />
                    <select class="select select-bordered" bind:value={selectedCustomerId} disabled={isPaid}>
                 
                        <option value="" disabled>Select a customer</option>
                        {#each filteredCustomers as customer (customer.id)}
                            <option value={customer.id}>{customer.name}</option>
                        {/each}
        
                    </select>
                    <input type="text" placeholder="Or enter new customer name" class="input input-bordered" bind:value={currentInvoice.customerName} disabled={isPaid ||
selectedCustomerId} />
                    <div class="grid grid-cols-2 gap-4 mt-2">
                        <input type="date" class="input input-bordered" bind:value={currentInvoice.issueDate} disabled={isPaid} />
                        <input type="date" class="input input-bordered" bind:value={currentInvoice.dueDate} disabled={isPaid} />
               
                    </div>
                    <div class="form-control mt-2">
                        <label class="label cursor-pointer"><span class="label-text">Apply Tax ({currentInvoice.taxRate}%)</span><input type="checkbox" class="toggle toggle-primary" bind:checked={currentInvoice.applyTax} disabled={isPaid} /></label>
                    </div>
                  
   
                    </div></div>
       
                 <div class="card bg-base-200 
shadow-xl border"><div class="card-body p-6">
                    <h2 id="add-from-inventory-title" class="card-title text-xl font-greycliffmed">Add From Inventory</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <select class="select select-bordered md:col-span-2" bind:value={selectedItemId} disabled={isPaid}><option disabled selected value="">Select an item</option>{#each $inventory as item}<option value={item.id}>{item.name} (Stock: {item.quantity}) - {item.currency}</option>{/each}</select>
      
                        <input type="number" bind:value={selectedItemQty} min="1" class="input input-bordered" disabled={isPaid}>
                    </div>
                   
                 <div class="card-actions justify-end mt-4"><button type="button" class="btn btn-secondary" on:click={handleAddItemFromInventory} disabled={isPaid}>Add Item</button></div>
           
                </div></div>
                <div class="card bg-base-200 shadow-xl border"><div class="card-body p-6">
                    <h2 class="card-title text-xl font-greycliffmed">Add Custom Item</h2>
                        <div class="grid grid-cols-2 md:grid-cols-[1fr,80px] lg:grid-cols-[1fr,100px,1fr,1fr] gap-4 items-end">
                    
                            <input type="text" placeholder="Item Name" class="input input-bordered col-span-2 lg:col-span-1" bind:value={customItem.name} disabled={isPaid} />
                        <input type="number" placeholder="Qty" class="input input-bordered" bind:value={customItem.quantity} min="1" disabled={isPaid}/>
                        
                        <div class="input-group col-span-2 lg:col-span-2">
                            <input type="number" placeholder="Price" class="input input-bordered w-full" bind:value={customItem.price} min="0" step="0.01" disabled={isPaid} />
                            <select 
                                class="select select-bordered" 
                                bind:value={customItem.currency} 
                                disabled={isPaid || (!!currentInvoice.paymentCurrency && currentInvoice.items.length > 0)}
                            >
                                {#if !currentInvoice.paymentCurrency || currentInvoice.items.length === 0}
                                    <option disabled selected value="USDC">Currency</option>
                                    {#each $mints as mint}<option value={mint.name}>{mint.name}</option>{/each}
                                {:else}
                                    <option value={currentInvoice.paymentCurrency}>{currentInvoice.paymentCurrency}</option>
                                {/if}
                            </select>
                        </div>
                       
                        </div>
                    <div class="card-actions justify-end mt-4"><button type="button" class="btn btn-accent" on:click={handleAddCustomItem} disabled={isPaid}>Add Custom Item</button></div>
                </div></div>
            </div>

            
            <div class="printable-area">
                
<div id="invoice-preview" class="card w-full bg-white shadow-xl border">
                    <div class="card-body p-8 invoice-preview text-sm">
                        <div class="flex justify-between items-start">
                            <div><h2 class="text-2xl font-bold font-greycliffbold">{$storeName ||
'Your Company'}</h2></div>
                            <div class="text-right"><h3 class="text-xl font-bold">INVOICE</h3><p class="opacity-70">{currentInvoice.number}</p></div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mt-8">
               
                            <div>
                                <p class="font-bold">Bill To:</p>
                                <p>{currentInvoice.customerName ||
'Customer Name'}</p>
                            </div>
                            <div class="text-right">
                                <p><span class="font-bold">Issue Date:</span> {dayjs(currentInvoice.issueDate).format('MMM D, YYYY')}</p>
     
                                <p><span class="font-bold">Due Date:</span> {dayjs(currentInvoice.dueDate).format('MMM D, YYYY')}</p>
                            </div>
                        </div>
                
                        <div class="overflow-x-auto mt-6">
                            
                            <table class="table w-full"><thead class="bg-gray-50 text-gray-700"><tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th><th class="no-print"></th></tr></thead>
                          
                            <tbody>
                                
                                {#each currentInvoice.items as item (item.variantId || item.id)}<tr><td>{item.name}</td><td class="text-center">{item.quantity}</td><td class="text-right">${(item.price ||
0).toFixed(2)}</td><td class="text-right">${(item.quantity * (item.price || 0)).toFixed(2)}</td><td class="no-print text-center p-1"><button type="button" class="btn btn-ghost btn-xs" on:click={() => removeItem(item.variantId || item.id)} disabled={isPaid}>✕</button></td></tr>{/each}
                                {#if currentInvoice.items.length === 0}<tr><td colspan="5" class="text-center opacity-70 py-4">No items added yet.</td></tr>{/if}
                            </tbody>
            
                        </table>
                            
                        </div>
                        <div class="flex justify-between items-end mt-6">
    
                            <div class="text-center">
                                {#if !isPaid}
                                    <div id="qr-code-invoice" class="mb-2 min-h-[200px] min-w-[200px] flex 
items-center justify-center text-sm opacity-70">Click "Pay" to generate code.</div>
                                    <button type="button" class="btn btn-primary btn-sm no-print" on:click={generateQrCodePreview} disabled={!librariesLoaded}>Pay with Solana</button>
                                {/if}
                
                            </div>
                            <div class="w-full max-w-xs text-right">
                                <div class="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                       
                                {#if currentInvoice.applyTax}<div class="flex justify-between mt-1"><span>Tax ({currentInvoice.taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>{/if}
                                <div class="divider my-1"></div>
                                <div class="flex justify-between font-bold text-lg"><span>Total ({currentInvoice.paymentCurrency ||
'N/A'}):</span><span>${total.toFixed(2)}</span></div>
               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
       
 <div class="modal-action">
            <button type="button" class="btn" on:click={() => dispatch('close')}>Close</button>
            
            <button type="button" class="btn btn-success" 
                on:click={saveInvoice} disabled={isPaid}>Save Invoice</button>
        </div>
    </div>
</div>
