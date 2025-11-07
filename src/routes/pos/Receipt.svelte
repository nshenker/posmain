<script lang="ts">
    import dayjs from 'dayjs';
    import { onMount } from 'svelte'; 
    import solanaLogo from "../../lib/images/solanaLogoMark.png"; // Import retained for component consistency
    
    // Declare dynamic import target for QR code function
    let createQR: any; 

    export let transaction;
    export let storeName;
    export let merchantLogo;
    export let businessAddress;

    // Use the stored subtotal and taxAmount from the transaction object for pre-discount display.
    const rawSubtotal = transaction.subtotal; 
    const rawTaxAmount = transaction.taxAmount;
    const loyaltyDiscountAmount = transaction.loyaltyDiscountAmount || 0;
    const pointsRedeemed = transaction.pointsRedeemed || 0;
    const orderDiscountAmount = transaction.orderDiscountAmount || 0;
    const orderDiscountCode = transaction.orderDiscountCode || null;
    
    const preTaxSubtotal = (transaction.items || []).reduce((sum, item) => sum + (item.adjustedPrice ?? item.price) * item.quantity, 0) || rawSubtotal;
    const finalPaidAmount = transaction.uiAmount;
    const preDiscountTotal = rawSubtotal + rawTaxAmount;
    
    function getLineItemDetails(item) {
        const finalPrice = item.adjustedPrice ?? item.price;
        const lineTotal = finalPrice * item.quantity;
        const adjustmentPercent = item.priceAdjustmentPercent ?? 0;
        let nameLine = `${item.quantity} x ${item.name}`;
        
        if (adjustmentPercent !== 0) {
            const type = adjustmentPercent > 0 ? 'Markup' : 'Discount';
            nameLine += ` (${Math.abs(adjustmentPercent).toFixed(1)}% ${type})`;
        }
        
        return { nameLine, lineTotal };
    }

    onMount(async () => {
        if (typeof window !== 'undefined') {
            if (transaction.txid && !transaction.txid.startsWith('pi_') && !transaction.txid.startsWith('invoice-')) {
                try {
                    const solanaPay = await import('@solana/pay');
                    createQR = solanaPay.createQR;
                    
                    await new Promise(resolve => setTimeout(resolve, 0));
                    renderQrCode();
                    
                } catch (e) {
                    console.error("Failed to load createQR for printing:", e);
                }
            }
        }

        setTimeout(() => {
            window.print();
        }, 150); 
    });

    function renderQrCode() {
        const qrCodeElement = document.getElementById('receipt-qr-code-target');
        if (createQR && qrCodeElement && transaction.txid) {
            const solscanUrl = `https://solscan.io/tx/${transaction.txid}`;
            
            // FINAL FIX: Use the three-argument call (URL, size, background). 
            // This positional signature is the most reliable way to enforce a background 
            // without triggering or misplacing a logo.
            const qr = createQR(solscanUrl, 120, 'white'); 
            
            qrCodeElement.innerHTML = '';
            qr.append(qrCodeElement);
        }
    }
</script>

<style>
    /* These styles are scoped to this component and will only be applied for printing */
    .receipt-container {
        font-family: 'monospace', monospace;
        width: 280px;
        padding: 15px;
        color: #000;
        background-color: #fff;
    }
    
    .text-center { text-align: center;
    }
    .font-bold { font-weight: bold; }
    .block { display: block;
    }
    .mt-4 { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem;
    }
    .text-xs { font-size: 11px; }
    .whitespace-pre-line { white-space: pre-line;
    }

    .header-main {
        font-size: 20px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
    }

    .header-sub {
        font-size: 11px;
        margin: 0;
    }

    .hr {
        border-top: 1px dashed #000;
        margin: 12px 0;
    }
    
    .flex-between {
        display: flex;
        justify-content: space-between;
    }

    .item-row span:first-child {
        text-align: left;
        flex-grow: 1;
        padding-right: 8px;
    }
    .item-row span:last-child {
        text-align: right;
    }
    
    .total-row {
        font-size: 16px;
        font-weight: bold;
    }

    .success-banner {
        font-size: 18px;
        font-weight: bold;
        color: #28a745; /* Green color */
        margin-top: 15px;
        margin-bottom: 15px;
    }
    
    /* MODIFIED: Centered and added explicit white background for contrast */
    #receipt-qr-code-target {
        background-color: white;
        padding: 10px; /* Increased padding slightly */
        display: block; /* Ensures it takes full width for margin auto to work */
        margin: 0 auto 10px auto; /* Centers the block element and adds bottom margin */
        width: 120px; /* Explicit width for the QR code area */
        height: 120px; /* Explicit height for the QR code area */
    }
    /* Ensure the SVG inside the QR target is also centered */
    #receipt-qr-code-target svg {
        display: block;
        margin: auto;
    }
</style>

<div class="receipt-container">
    <div class="text-center">
        {#if merchantLogo}
            <img src={merchantLogo} alt="Logo" style="max-width: 120px; margin: 0 auto 10px;"
            />
        {/if}
        <div class="header-main">{storeName || 'GROCERIA MARKET'}</div>
        {#if businessAddress}
            <p class="header-sub whitespace-pre-line">{businessAddress}</p>
        {/if}
    </div>

    <div class="hr"></div>

    <div class="text-xs">
        <div class="flex-between">
            <span>Receipt #: {transaction.txid.substring(0, 8).toUpperCase()}</span>
            <span>Time: {dayjs.unix(transaction.timestamp).format("h:mm A")}</span>
        </div>
    </div>

 
   
    <div class="hr"></div>

    <div>
        <div class="font-bold mb-2">Items Purchased</div>
        {#if transaction.items && transaction.items.length > 0}
            {#each transaction.items as item}
                {@const details = getLineItemDetails(item)}
                <div class="item-row flex-between text-xs">
       <span>{details.nameLine}</span>
          
           <span>{details.lineTotal.toFixed(2)}</span>
                </div>
            {/each}
        {:else}
             <div class="item-row flex-between text-xs">
      <span>1 x Custom Amount</span>
                <span>{transaction.uiAmount.toFixed(2)}</span>
           </div>
  
       {/if}
    </div>

    <div class="hr"></div>

    <div class="text-xs">
         <div class="flex-between">
            <span>Subtotal:</span>
            <span>{rawSubtotal.toFixed(2)}</span>
  </div>
        
        {#if orderDiscountAmount > 0}
            <div class="flex-between font-bold" style="margin-top: 4px;
            color: #dc3545;">
                <span>Discount {orderDiscountCode ? `(${orderDiscountCode})` : ''}:</span>
                <span>- {orderDiscountAmount.toFixed(2)}</span>
            </div>
        {/if}

        {#if transaction.taxable && rawTaxAmount > 0}
           <div class="flex-between">
                
 <span>Sales Tax ({ (transaction.taxRate ||
0).toFixed(3) }%):</span>
                <span>{rawTaxAmount.toFixed(2)}</span>
            </div>
        {/if}
        
        {#if loyaltyDiscountAmount > 0}
             <div class="flex-between font-bold" style="margin-top: 4px;
            color: #dc3545;">
                <span>Loyalty Discount ({pointsRedeemed} Pts):</span>
          <span>- {loyaltyDiscountAmount.toFixed(2)}</span>
            </div>
        {/if}
        <div class="flex-between total-row" style="margin-top: 8px;">
            <span>Total Paid:</span>
            <span>{finalPaidAmount.toFixed(2)} {transaction.mint}</span>
        </div>
   
    </div>
    
    <div class="hr"></div>

    <div class="text-xs">
       {#if transaction.txid.startsWith('pi_')}
            <p>Payment Method: Credit Card</p>
            <p style="word-break: break-all;">Payment ID: {transaction.txid}</p>
        {:else if transaction.txid.startsWith('invoice-')}
            <p>Payment Method: Invoice</p>
            <p style="word-break: break-all;">Invoice ID: {transaction.txid}</p>
        {:else}
            <p>Payment Method: Solana Wallet</p>
            <p class="text-center" style="margin-bottom: 5px;">Scan for Transaction Details:</p>
            

<div id="receipt-qr-code-target"> 
                </div>
            <p class="text-center">TX Hash: {transaction.txid.substring(0, 4)}...{transaction.txid.substring(transaction.txid.length - 4)}</p>
            <p class="text-center">Network Fee: ~0.00001 SOL</p>
       {/if}
    </div>

    <div class="success-banner text-center">
        PAYMENT SUCCESSFUL
    </div>

    <div class="text-center text-xs">
        <p>Thank you for shopping with us!</p>
    </div>
</div>
