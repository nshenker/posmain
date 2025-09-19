<script lang="ts">
    export let transaction;
    export let storeName;
    export let merchantLogo;
</script>

<style>
    .receipt-container {
        display: none; /* Hidden by default, only visible for printing */
    }

    @media print {
        /* Basic print reset */
        @page {
            size: 80mm auto; /* Standard thermal printer roll width */
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        .receipt-container {
            display: block;
            font-family: 'Courier New', Courier, monospace;
            width: 280px; /* A bit of padding for 300px/80mm rolls */
            padding: 10px;
            font-size: 12px;
            color: #000;
            line-height: 1.4;
        }
        
        /* Utility classes for printing */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .block { display: block; }
        .w-full { width: 100%; }
        .mt-4 { margin-top: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .text-xs { font-size: 10px; }
        .break-all { word-break: break-all; }

        .hr {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }
        
        .logo {
            max-width: 120px;
            margin: 0 auto 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 2px 0;
        }
        th {
            border-bottom: 1px solid #000;
        }
    }
</style>

<div class="receipt-container">
    <div class="text-center">
        {#if merchantLogo}
            <img src={merchantLogo} alt="Logo" class="logo" />
        {/if}
        <span class="block font-bold text-lg">{storeName}</span>
        <span class="block text-xs">{new Date(transaction.timestamp * 1000).toLocaleString()}</span>
    </div>

    <div class="hr"></div>

    <table class="w-full">
        <thead>
            <tr>
                <th style="text-align: left;">Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            {#if transaction.items && transaction.items.length > 0}
                {#each transaction.items as item}
                    <tr>
                        <td>{item.name}</td>
                        <td class="text-right">{item.quantity}</td>
                        <td class="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <td>Custom Amount</td>
                    <td class="text-right">1</td>
                    <td class="text-right">{transaction.uiAmount.toFixed(2)}</td>
                </tr>
            {/if}
        </tbody>
    </table>

    <div class="hr"></div>
    
    <div class="mt-4 text-right">
        <p class="font-bold">TOTAL: {transaction.uiAmount} {transaction.mint}</p>
    </div>

    <div class="hr"></div>
    
    <div class="text-center mt-4">
        <p>Thank you for your business!</p>
        <p class="text-xs break-all">TX: {transaction.txid}</p>
    </div>
</div>
