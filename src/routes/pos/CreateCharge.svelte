<script lang='ts'>
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
	import { pmtAmt, selectedMint, invoices } from '../stores.js';
    import Keyboard from "svelte-keyboard";
    import dayjs from 'dayjs';
	import bonkLogo from "../../lib/images/BonkLogo.png";
    import solLogo from "../../lib/images/solanaLogoMark.png";

    const keys = [
        { row: 0, value: "1"}, { row: 0, value: "2"}, { row: 0, value: "3"}, 
        { row: 1, value: "4"}, { row: 1, value: "5"}, { row: 1, value: "6"},
        { row: 2, value: "7"}, { row: 2, value: "8"}, { row: 2, value: "9"},
        { row: 3, value: "<" }, { row: 3, value: "0"}, { row: 3, value: "."}
    ];
    
    let left = "";
    let right = "";
    let decimalsActive = false;
    let invoiceModal: HTMLDialogElement;

    onMount(() => {
        $pmtAmt = "0.00";
        left = "";
        right = "";
        decimalsActive = false;
    });

    function loadInvoice(invoice) {
        if (typeof invoice.total !== 'number') {
            alert('This invoice has outdated data and cannot be loaded. Please re-create it in the invoicing section.');
            return;
        }
        
        const amountStr = invoice.total.toFixed(2);
        const parts = amountStr.split('.');
        left = parts[0];
        right = parts[1] || "";
        decimalsActive = right.length > 0;
        
        $pmtAmt = parseFloat(amountStr).toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        });
        $selectedMint = invoice.paymentCurrency;
        invoiceModal.close(); // Close modal after selection
    }

    function createQRCode() {
        if (parseFloat($pmtAmt.replace(/,/g, '')) > 0) {
            goto('/present');
        } else {
            alert("Please enter an amount greater than zero.");
        }
	}

    const onKeydown = (event) => {
        const detail = event.detail;

        if ($pmtAmt === "0.00") {
            left = "";
            right = "";
            decimalsActive = false;
        }

        if (detail == "<") {
            if (!decimalsActive) {
                left = left.slice(0, -1);
            } else {
                right = right.slice(0, -1);
                if (right === "") decimalsActive = false;
            }
        } else if (detail == ".") {
            if (!decimalsActive) decimalsActive = true;
        } else {
            if (!decimalsActive) {
                left += detail;
            } else if (right.length < 4) {
                right += detail;
            }
        }
        
        const fullAmount = `${left || '0'}${right ? '.' + right : ''}`;
        $pmtAmt = parseFloat(fullAmount).toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4 
        });
    }
</script>

<dialog bind:this={invoiceModal} class="modal">
    <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg">Select an Invoice to Load</h3>
        <div class="py-4 overflow-y-auto h-96">
            <table class="table table-zebra w-full">
                <tbody>
                    {#each $invoices.filter(inv => inv.status === 'Saved' && typeof inv.total === 'number') as invoice (invoice.id)}
                    <tr class="hover cursor-pointer" on:click={() => loadInvoice(invoice)}>
                        <td>
                            <div class="font-bold">{invoice.customerName}</div>
                            <div class="text-sm opacity-50">{invoice.number}</div>
                        </td>
                        <td class="text-right">
                            {invoice.total.toFixed(2)}
                            <span class="badge badge-ghost badge-sm">{invoice.paymentCurrency}</span>
                        </td>
                    </tr>
                    {/each}
                    {#if $invoices.filter(inv => inv.status === 'Saved').length === 0}
                        <tr><td colspan="2" class="text-center text-gray-400 py-4">No saved invoices.</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn">Close</button>
            </form>
        </div>
    </div>
</dialog>

<div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8 items-center text-center">
        <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Create Charge</h2>
        <div class="flex items-center space-x-2">
            {#if $selectedMint === "USDC"}
                <svg class="h-9 w-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000">
                    <path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" fill="#2775ca"/>
                    <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
                </svg>
            {:else if $selectedMint === "SOL"}
               <img src={solLogo} class="w-10" alt="SOL" />
            {:else if $selectedMint === "BONK"}
                <img src={bonkLogo} class="w-10 rounded-full" alt="BONK" />
            {/if}
            <input bind:value={$pmtAmt} class="input input-bordered w-48 text-right text-xl font-mono" placeholder="0.00" readonly />
        </div>
        <div class="mt-4 w-full max-w-xs">
            <Keyboard custom="{keys}" on:keydown="{onKeydown}" />
        </div>
        <div class="card-actions justify-center mt-6 w-full">
            <button on:click={createQRCode} class="btn btn-primary btn-wide text-white font-greycliffbold normal-case">Create QR Code</button>
        </div>
        <div class="divider">OR</div>
        <button class="btn btn-outline btn-wide" on:click={() => invoiceModal.showModal()}>Load from Invoice</button>
    </div>
</div>
