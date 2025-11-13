<script lang="ts">
    import dayjs from 'dayjs';
    import { onMount } from 'svelte'; 
    import solanaLogo from "../../lib/images/solanaLogoMark.png";
// RE-ADDED: Used for the QR code logo

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
    const orderDiscountAmount = transaction.orderDiscountAmount || null;
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
            const type = adjustmentPercent > 0 ?
            'Markup' : 'Discount';
            nameLine += ` (${Math.abs(adjustmentPercent).toFixed(1)}% ${type})`;
        }
        
        return { nameLine, lineTotal };
    }

    onMount(async () => {
        if (typeof window !== 'undefined') {
            if (transaction.txid && !transaction.txid.startsWith('pi_') && !transaction.txid.startsWith('invoice-') && transaction.paymentType !== 'Cash App') {
                try {
                    const solanaPay = await import('@solana/pay');
                    createQR 
= solanaPay.createQR;
                    
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
            
            // Construct the Solscan URL
            const solscanUrl = `https://solscan.io/tx/${transaction.txid}`;
            // FIX: Use 4 arguments: (URL, size (150), background color, LOGO IMAGE)
            // The logo image import is automatically converted to a base64 string or path that the library can use.
            const qr = createQR(solscanUrl, 150, 'white', solanaLogo); 
            
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
    
    /* MODIFIED: Increased size to 150px as requested */
    #receipt-qr-code-target {
        background-color: white;
        padding: 0px; 
        display: block;
        margin: 0 auto 10px auto;
        width: 150px;
        /* Increased size */
        height: 150px;
        /* Increased size */
    }
    
    /* Ensure the generated SVG/Canvas inside the QR target is centered and clean */
    #receipt-qr-code-target > svg,
    #receipt-qr-code-target > canvas {
        display: block;
        margin: auto;
        width: 100% !important; 
        height: 100% !important;
        background-color: white !important;
    }
</style>

<div class="receipt-container">
    <div class="text-center">
        {#if merchantLogo}
            <img src={merchantLogo} alt="Logo" style="max-width: 120px; margin: 0 auto 10px;"
/>
        {/if}
        <div class="header-main">{storeName ||
'GROCERIA MARKET'}</div>
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
       {#if transaction.paymentType === 'Cash App'}
            <p>Payment Method: Cash App Pay</p>
            <p style="word-break: break-all;">Payment ID: {transaction.txid}</p>
        {:else if transaction.txid.startsWith('pi_')}
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
            <p 
class="text-center">Network 
Fee: ~0.00001 SOL</p>
       {/if}
    </div>

    <div class="success-banner text-center">
        PAYMENT SUCCESSFUL
    </div>

    <div class="text-center text-xs">
        <p>Thank you for shopping with us!</p>
    </div>
</div>
