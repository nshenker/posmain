<script lang='ts'>
    import { successArray, mints, customers } from '../stores.js';
    import { onMount, createEventDispatcher } from 'svelte';
    import { exportToCSV, exportToJSON } from '../../utils/csv.js';
    import dayjs from 'dayjs';
    import { triggerPrint } from '../printStore.js';
    import { showToast } from '../toastStore.js'; // Import showToast

    const dispatch = createEventDispatcher();

    let searchTerm = '';
    let filteredTransactions = [];
    let startDate = '';
    let endDate = '';
    let expandedTransactions = {};
    // State to track expanded rows

    // Function to format date from timestamp
    function formatDateFromTimestamp(timestamp) {
        if (!timestamp || typeof timestamp !== 'number') return 'Invalid Date';
        try {
            return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
        } catch (error) {
            console.error("Error formatting timestamp:", timestamp, error);
            return 'Invalid Date';
        }
    }

     // Function to format date for filename (YYYY-MM-DD)
    function formatDateForFilename(date) {
        try {
            return dayjs(date).format('YYYY-MM-DD');
        } catch (error) {
            console.error("Error formatting date for filename:", date, error);
            return 'date-error';
        }
    }

    // --- MODIFIED --- Function to toggle transaction expansion
    function toggleTransaction(txn) {
        const key = txn.txnId ||
        txn.txid; // Use new internal ID or fallback
        expandedTransactions[key] = !expandedTransactions[key];
        expandedTransactions = expandedTransactions; // Trigger reactivity
    }
    // --- END MODIFIED ---

    // Reactive filtering
    $: {
        let transactions = $successArray ||
        [];

        // 1. Filter by date range
        let dateFiltered = transactions;
        if (startDate) {
            try {
                const start = dayjs(startDate).startOf('day').unix();
                dateFiltered = dateFiltered.filter(txn => txn.timestamp >= start);
            } catch (e) { console.error("Invalid start date");
            }
        }
        if (endDate) {
             try {
                const end = dayjs(endDate).endOf('day').unix();
                dateFiltered = dateFiltered.filter(txn => txn.timestamp <= end);
             } catch (e) { console.error("Invalid end date");
             }
        }

        // 2. Filter by search term
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            filteredTransactions = dateFiltered.filter(txn => {
                const mintName = getMintName(txn.mint)?.toLowerCase() || '';
                const customerName = getCustomerName(txn.customerId)?.toLowerCase() || 'walk-in';
                const paymentType = (txn.paymentType || txn.mint || '').toLowerCase();
                const total = (txn.uiAmount || 0).toString();
                const signature = (txn.txid || '').toLowerCase();

     
                return mintName.includes(lowerSearch) ||
                       customerName.includes(lowerSearch) ||
                       paymentType.includes(lowerSearch) ||
                       total.includes(lowerSearch) ||
                       signature.includes(lowerSearch);
            });
        } else {
            filteredTransactions = dateFiltered;
        }

        // Sort by timestamp, most recent first
        filteredTransactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    function getMintName(mintAddressOrName) {
        if (mintAddressOrName === 'USD') return 'USD (Card)';
        const mintInfo = $mints.find(m => m.mint === mintAddressOrName || m.name === mintAddressOrName);
        return mintInfo?.name || 'Unknown';
    }


    function getCustomerName(customerId) {
        if (!customerId) return 'Walk-in';
        return $customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
    }

    function handleExportCSV() {
        if (filteredTransactions.length === 0) return;
        const dataToExport = filteredTransactions.map(txn => ({
            Date: formatDateFromTimestamp(txn.timestamp),
            SignatureOrTxID: txn.txid || 'N/A',
            Total: (txn.uiAmount || 0).toFixed(2),
            Token: getMintName(txn.mint),
            PaymentType: txn.paymentType || getMintName(txn.mint),
            Customer: getCustomerName(txn.customerId),
            Items: (txn.items || []).map(item => `${item.name} (Qty: ${item.quantity || 1})`).join('; '),
 
            Subtotal: (txn.subtotal || 0).toFixed(2),
            Tax: (txn.taxAmount || 0).toFixed(2),
            'Loyalty Discount': (txn.loyaltyDiscountAmount || 0).toFixed(2),
            'Points Redeemed': txn.pointsRedeemed || 0,
        }));
        exportToCSV(dataToExport, `transactions-${formatDateForFilename(new Date())}.csv`);
    }

    // --- NEW FUNCTION: Export Tax Report ---
    function handleExportTaxReport() {
        if (filteredTransactions.length === 0) {
            showToast('No transactions to report.', 'error');
            return;
        }

        const dataToExport = filteredTransactions.map(txn => {
            // These values are stored pre-discount/pre-fee, which is the correct basis for tax reporting.
            const taxableRevenue = txn.subtotal || 0;
            const totalTaxAmount = txn.taxAmount || 0;
            const taxRate = txn.taxRate || 0;

            return {
                Date: formatDateFromTimestamp(txn.timestamp),
                'Transaction ID': txn.txid || 'N/A',
                'Customer': getCustomerName(txn.customerId),
                // Taxable Revenue is the subtotal before tax and before loyalty discount.
                'Taxable Revenue': taxableRevenue.toFixed(2),
                'Tax Rate (%)': taxRate.toFixed(3),
                'Tax Amount Collected': totalTaxAmount.toFixed(2),
                'Loyalty Discount (Pre-Tax)': (txn.loyaltyDiscountAmount || 0).toFixed(2),
                'Final Paid Amount': (txn.uiAmount || 0).toFixed(2),
                'Currency': getMintName(txn.mint),
            };
        });

        exportToCSV(dataToExport, `tax_report_${formatDateForFilename(new Date())}.csv`);
        showToast('Tax report exported successfully!', 'success');
    }
    // --- END NEW FUNCTION ---


    function handleExportJSON() {
        exportToJSON(filteredTransactions, `transactions-backup-${formatDateForFilename(new Date())}.json`);
    }

    function clearDateFilters() {
        startDate = '';
        endDate = '';
    }

</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-6xl h-[90vh] flex flex-col p-0">
        <div class="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 class="text-2xl font-greycliffbold">Transaction History</h2>
            <button class="btn btn-sm btn-circle btn-ghost" on:click={() => dispatch('close')}>✕</button>
        </div>

        <div class="p-4 bg-base-200 flex-shrink-0">
            <div class="flex flex-wrap gap-4 justify-between items-end">
   
                <div class="form-control flex-grow min-w-[200px]">
                    <label class="label" for="txn-search"><span class="label-text">Search Transactions</span></label>
<input id="txn-search" type="text" placeholder="Search..." class="input input-bordered w-full" bind:value={searchTerm} />
                </div>

                <div class="form-control">
                
                    <label class="label" for="start-date"><span class="label-text">Start Date</span></label>
<input id="start-date" type="date" class="input input-bordered" bind:value={startDate} />
                </div>
                <div class="form-control">
                    <label class="label" for="end-date"><span class="label-text">End Date</span></label>
                    <input id="end-date" type="date" class="input input-bordered" bind:value={endDate} 
                    />
</div>

      
                <div class="flex gap-2 items-end">
                     <button class="btn btn-ghost" on:click={clearDateFilters}>Clear Dates</button>
                    <div class="dropdown dropdown-end">
                        <button class="btn btn-primary">Export</button>
  
                        <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                            <li><button on:click={handleExportCSV}>Export All Details (CSV)</button></li>
                            <li><button on:click={handleExportTaxReport}>Export Tax Report (CSV)</button></li> <li><button on:click={handleExportJSON}>Export as JSON</button></li>
                      
                        </ul>
                    </div>
    
                </div>
            </div>
</div>

        <div class="overflow-auto flex-grow">
            <table class="table table-pin-rows table-zebra w-full table-sm"> <thead class="bg-base-300">
<tr>
                 
                        <th></th> <th>Date</th>
                      
                        <th>Customer</th>
                        <th>Type</th>
<th>Token</th>
                      
                        <th class="text-right">Total</th>
                        <th>Signature / Txn ID</th>
                      
                        <th></th> </tr>
                </thead>
<tbody>
       
                    {#if filteredTransactions.length > 0}
                        {#each filteredTransactions as txn (txn.txnId ||
                        txn.txid)}
                            <tr class="hover">
 
                                <td>
                                    {#if txn.items 
                                    && txn.items.length > 0 && !txn.items[0]?.id.startsWith('custom-')}
                          
                                        <button class="btn btn-xs btn-ghost" on:click={() => toggleTransaction(txn)}>
                       
                                            {expandedTransactions[txn.txnId ||
                                            txn.txid] ?
                                            '▼' : '►'}
                                        </button>
                                    {/if}
                    
   
                                </td>
                                <td>{formatDateFromTimestamp(txn.timestamp)}</td>
                                <td>{getCustomerName(txn.customerId)}</td>
  
                                
                                <td><span class="badge badge-ghost">{txn.paymentType ||
                                getMintName(txn.mint)}</span></td>
<td>{getMintName(txn.mint)}</td>
                                <td class="text-right font-mono">${(txn.uiAmount || 0).toFixed(2)}</td>
<td class="font-mono text-xs break-all max-w-[150px] truncate">
                                    {#if txn.txid && txn.txid.startsWith('pi_')}
                    
                                        <a href={`https://dashboard.stripe.com/payments/${txn.txid}`} target="_blank" rel="noopener noreferrer" class="link link-hover">
{txn.txid.substring(0, 10)}... (Stripe)
                                        </a>
{:else if txn.txid}
          
                                        <a href="https://solscan.io/tx/{txn.txid}" target="_blank" rel="noopener noreferrer" class="link link-hover">
{txn.txid.substring(0, 10)}...
                                 
                                        </a>
                                    {:else}
N/A
       
                                    {/if}
              
                                </td>
                                <td>
       
                                    <button class="btn btn-xs btn-outline" on:click={() => triggerPrint(txn)}>Print</button>
 
                                </td>
                                </tr>
 
                            {#if expandedTransactions[txn.txnId ||
                            txn.txid] && txn.items && txn.items.length > 0 && !txn.items[0]?.id.startsWith('custom-')}
                                <tr class="bg-base-200">
                               
                            
                                    <td colspan="8" class="p-0">
                                        <div class="p-4">
                                            <h5 class="font-bold text-sm mb-2">Purchased Items:</h5>
 
    
                                            <ul class="list-disc pl-6 text-xs">
                                                {#each txn.items 
                                                as item}
      
                                                  <li>{item.quantity}x {item.name} @ ${(item.price ||
                                                0).toFixed(2)} each</li>
                                  
                                              {/each}
                                            </ul>
       
                                   
                                        </div>
                                    </td>
                               
                          
                                </tr>
                            {/if}
                            {/each}
                    {:else}
                  
                        
    <tr>
<td colspan="8" class="text-center py-8">No transactions found matching your criteria.</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
</div>
    </div>
</div>
