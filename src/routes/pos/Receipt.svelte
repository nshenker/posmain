<script lang="ts">
    import dayjs from 'dayjs';
    export let transaction;
    export let storeName;
    export let merchantLogo;
    export let businessAddress;

    // Calculate tax and subtotal for display. NOTE: This is a display approximation.
    // In a real-world scenario, tax should be stored with the transaction.
    const taxRate = 0.08875; // Assuming a fixed tax rate for display
    const total = transaction.uiAmount;
    const subtotal = total / (1 + taxRate);
    const taxAmount = total - subtotal;
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
    
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .block { display: block; }
    .mt-4 { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .text-xs { font-size: 11px; }
    .whitespace-pre-line { white-space: pre-line; }

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
</style>

<div class="receipt-container">
    <div class="text-center">
        {#if merchantLogo}
            <img src={merchantLogo} alt="Logo" style="max-width: 120px; margin: 0 auto 10px;" />
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
                <div class="item-row flex-between text-xs">
                    <span>{item.quantity} x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)}</span>
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
            <span>{subtotal.toFixed(2)}</span>
        </div>
        <div class="flex-between">
            <span>Sales Tax ({ (taxRate * 100).toFixed(3) }%):</span>
            <span>{taxAmount.toFixed(2)}</span>
        </div>
        <div class="flex-between total-row" style="margin-top: 8px;">
            <span>Total:</span>
            <span>{total.toFixed(2)} {transaction.mint}</span>
        </div>
    </div>
    
    <div class="hr"></div>

    <div class="text-xs">
        <p>Payment Method: Solana Wallet</p>
        <p style="word-break: break-all;">Transaction Hash: {transaction.txid}</p>
        <p>Network Fee: ~0.00001 SOL</p>
    </div>

    <div class="success-banner text-center">
        PAYMENT SUCCESSFUL
    </div>

    <div class="text-center text-xs">
        <p>Thank you for shopping with us!</p>
    </div>
</div>
