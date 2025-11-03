<script lang='ts'>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { invoices, inventory, customers, storeName, businessAddress, publicKey, mints } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import { logHistory } from '../../utils/inventory.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';
    import InvoiceTransactionViewer from './InvoiceTransactionViewer.svelte'; // NEW IMPORT
    import dayjs from 'dayjs';
    import { browser } from '$app/environment';
    import { get } from 'svelte/store';
    import { triggerInvoicePrint } from '../printStore.js'; // Import triggerInvoicePrint
    //
    // LIBRARIES for Payment Link Generation
    //
    let encodeURL, BigNumber, web3;
    let librariesLoaded = false;
    let isPrinting = false; // Add printing state
    //
    // End LIBRARIES
    //

    const dispatch = createEventDispatcher();
    let invoiceToRemove = null;
    let findReference, FindReferenceError;
    
    let showTransactionViewer = false;
    let selectedTransaction = null;
    let intervalId;
    
    // --- LIBRARIES AND POLLING SETUP ---
    onMount(async () => {
         if (browser) {
            try {
                // Dynamic imports for Solana/QR code logic
                const solanaPay = await import('@solana/pay');
                const solanaWeb3 = await import('@solana/web3.js');
                const BigNumberLib = await import('bignumber.js');
                
                // Assign library functions
                findReference = solanaPay.findReference;
                FindReferenceError = solanaPay.FindReferenceError;
                encodeURL = solanaPay.encodeURL; // RETAINED: Only need encodeURL to get the string
                web3 = solanaWeb3; 
                BigNumber = BigNumberLib.default; 
                librariesLoaded = true;
                
                // Start initial check and continuous polling
                await checkInvoicePayments(); // Initial check
                intervalId = setInterval(checkInvoicePayments, 5000); // Poll every 5s
            } catch (e) {
            
                console.error("Failed to load Solana libraries", e);
    
                if (browser) showToast("Error: Could not load payment libraries.", "error");
            }
        }
    });
    
    onDestroy(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
    // --- END LIBRARIES AND POLLING SETUP ---

    // Function to generate a transaction record from a paid invoice
    function createTransactionFromInvoice(invoice) {
        // FIX: Calculate subtotal and taxAmount, as Receipt.svelte relies on them.
        const subtotal = (invoice.items || []).reduce((sum, item) => sum + item.quantity * item.price, 0);
        const taxAmount = invoice.applyTax ?
        subtotal * (invoice.taxRate / 100) : 0;
        
        return {
            txnId: invoice.txnId, 
            timestamp: dayjs(invoice.issueDate).unix(),
            uiAmount: invoice.total, // The final calculated total is what was paid
     
            mint: invoice.paymentCurrency,
            txid: invoice.txid,
            
            items: invoice.items,
            customerId: invoice.customerId,
            
            // ADDED: Crucial fields for Receipt.svelte
            subtotal: subtotal,
            taxAmount: taxAmount,
            taxRate: invoice.taxRate,
            taxable: invoice.applyTax,

     
            loyaltyDiscountAmount: invoice.loyaltyDiscountAmount ||
        0,
            pointsRedeemed: invoice.pointsRedeemed ||
        0,
        };
    }
    
    function processPaidInvoice(invoice, externalTxId = null) {
        // --- Core Invoice Update ---
        invoice.status = 'Paid';
        // Use a unique format for the internal ID
        invoice.txnId = invoice.txnId ||
        `inv-${Date.now().toString()}`; 
        // Set external ID if manual payment or found on chain
        invoice.txid = externalTxId ||
        `Manual_Inv_${invoice.number}`;       
        showToast(`Invoice ${invoice.number} was paid!`, 'success');
        
        // --- Inventory Deduction & History Logging ---
        invoice.items.forEach(item => {
            if (!String(item.id).startsWith('custom-')) {
                inventory.update(invs => {
                    return invs.map(i => {
                      
                        
                        if (i.id === item.id) {
          
                            if (i.type === 'variable' && item.variantId) {
                            
                                let variantFound = false;
               
                                i.variants = i.variants.map(v => {
     
                                    if 
                                    (v.id === item.variantId) {
                                  
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
        $invoices = $invoices;
        // Trigger reactivity
    }

    async function checkInvoicePayments() {
        if (!librariesLoaded) return;
        const connection = new web3.Connection("https://solana-mainnet.g.alchemy.com/v2/5Bo-yRwJYXcscWQkkah0KJ-9jPmm5cSi");
        const invoicesToCheck = $invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue');
        for (const invoice of invoicesToCheck) {
            // Due date check only affects status, not payment processing
            if (dayjs().isAfter(dayjs(invoice.dueDate)) && invoice.status !== 'Overdue') {
                invoice.status = 'Overdue';
            }

            if (invoice.reference) {
                try {
                    const signatureInfo = await findReference(connection, new web3.PublicKey(invoice.reference), { finality: 'confirmed' });
                    // If reference found, set the signature as the external Tx ID
                    processPaidInvoice(invoice, signatureInfo.signature);
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
    
    function viewTransaction(invoice) {
        // Only allow viewing if we have a transaction ID assigned
        if (invoice.txid) {
            selectedTransaction = createTransactionFromInvoice(invoice);
            showTransactionViewer = true;
        }
    }
    
    function confirmRemoveInvoice(invoiceId) {
        invoiceToRemove = invoiceId;
    }

    function doRemoveInvoice() {
        if (invoiceToRemove) {
            $invoices = $invoices.filter(inv => inv.id !== invoiceToRemove);
            invoiceToRemove = null;
        }
    }
    
    // --- FINAL FIX FUNCTION: Get Solana Pay URL ---
    function getSolanaPayUrl(invoice): string | null {
        if (!librariesLoaded || invoice.total <= 0) return null;
        
        const total = invoice.total;
        const reference = new web3.PublicKey(invoice.reference);
        const selectedToken = get(mints).find(m => m.name === invoice.paymentCurrency);
        if (!selectedToken) return null;

        const urlParams: any = {
            recipient: new web3.PublicKey(get(publicKey)),
            amount: new BigNumber(total),
            reference: reference,
            label: `Invoice ${invoice.number}`,
            message: `Payment for ${invoice.customerName}`,
            memo: `Invoice #${invoice.number}`
        };
        if (selectedToken.name !== 'SOL') {
            urlParams.splToken = new web3.PublicKey(selectedToken.mint);
        }

        return encodeURL(urlParams);
    }
    // --- END FINAL FIX FUNCTION ---
    
    // --- MODIFIED FUNCTION: Print Invoice ---
    async function printInvoice(invoice) {
        if (typeof window === 'undefined') return;
        
        if (isPrinting) return;
        isPrinting = true;
        
        // The total property is already saved to the invoice object when created/updated
        const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const taxAmount = invoice.applyTax ? subtotal * (invoice.taxRate / 100) : 0;
        const total = subtotal + taxAmount; 
        
        const isUnpaid = invoice.status !== 'Paid' && invoice.reference && total > 0;
        let solanaPayUrl = null; // Will hold the URL string
        
        if (isUnpaid) {
            // CRITICAL: Generate the URL here, which is a fast synchronous operation
            solanaPayUrl = getSolanaPayUrl(invoice);
            
            if (!solanaPayUrl) {
                showToast("Could not generate Solana Pay URL. Check console or connection.", "error");
                isPrinting = false; 
                return;
            }
        }
        
        const invoiceToPrintData = { 
            ...invoice, 
            total: total, 
        };

        // Pass the generated URL string (or null) to the printable component
        // The InvoicePrintable component's onMount will handle the rendering and subsequent window.print() call.
        triggerInvoicePrint(
            invoiceToPrintData, 
            get(storeName), 
            get(businessAddress),
            get(publicKey), 
            get(mints),      
            solanaPayUrl 
        );
        
        // Release the lock immediately, the printing process is now handled asynchronously by the component lifecycle
        isPrinting = false;
    }
    // --- END MODIFIED FUNCTION ---
</script>

{#if invoiceToRemove}
    <ConfirmationModal
        message="Are you sure you want to permanently delete this invoice?"
        on:confirm={doRemoveInvoice}
        on:cancel={() => invoiceToRemove = null}
    />
{/if}

{#if showTransactionViewer && selectedTransaction}
    <InvoiceTransactionViewer 
        transaction={selectedTransaction} 
        on:close={() => showTransactionViewer = false} 
    />
{/if}


<div class="modal modal-open">
    <div class="modal-box w-11/11 max-w-4xl">
        <h3 class="font-bold text-lg">Past Invoices</h3>
   
        <div class="py-4">
             <div id="saved-invoices-card" class="overflow-x-auto">
                <table class="table w-full"><thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Payment ID</th><th>Actions</th></tr></thead>
                    <tbody>
   
                      {#each $invoices as invoice (invoice.id)}
        
                         <tr class="hover">
                            <td>{invoice.number}</td>
                      
                     
                            <td>{invoice.customerName}</td>
        
                            <td>{dayjs(invoice.issueDate).format('YYYY-MM-DD')}</td>
                            <td class="text-right font-mono">${(invoice.total ||
        0).toFixed(2)}</td>
                            <td><span class="badge {invoice.status === 'Paid' ? 'badge-success' : invoice.status === 'Overdue' ? 'badge-error' : 'badge-info'} badge-outline">{invoice.status}</span></td>
                            <td>
                             
                                {#if invoice.status === 'Paid'}
                                    <button class="btn btn-xs btn-outline btn-info" on:click={() => viewTransaction(invoice)}>View Txn</button>
                     
                            {:else}
                  
                                    N/A
                                {/if}
   
                            </td>
                      
                        <td class="space-x-1">
                            
                            <button class="btn btn-xs btn-outline" on:click={() => dispatch('view', invoice)}>View</button>
                                <button class="btn btn-xs 
                   
                                   
        btn-outline btn-success" on:click={() => markAsPaid(invoice.id)} disabled={invoice.status === 'Paid'}>Mark Paid</button>
                                <button class="btn btn-xs btn-outline btn-info" on:click={() => printInvoice(invoice)} disabled={isPrinting}>Print</button>
                                <button class="btn btn-xs btn-outline btn-error" on:click={() => confirmRemoveInvoice(invoice.id)}>Delete</button>
                            </td>
            
            
                        </tr>
    
                     {/each}
                        {#if $invoices.length === 0}<tr><td colspan="7" class="text-center opacity-70 py-4">No saved invoices.</td></tr>{/if}
                    </tbody>
          
                </table>
           
            </div>
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
