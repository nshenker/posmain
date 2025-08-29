<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
	import { pmtAmt, selectedMint, invoices } from '../stores.js';
    import Keyboard from "svelte-keyboard";
    import dayjs from 'dayjs';
	import bonkLogo from "../../lib/images/BonkLogo.png";
    import solLogo from "../../lib/images/solanaLogoMark.png";
    import usdcLogo from "../../lib/images/usdc-logo.png"; // Assuming a USDC logo exists

    const keys = [
        { row: 0, value: "1"}, { row: 0, value: "2"}, { row: 0, value: "3"}, 
        { row: 1, value: "4"}, { row: 1, value: "5"}, { row: 1, value: "6"},
        { row: 2, value: "7"}, { row: 2, value: "8"}, { row: 2, value: "9"},
        { row: 3, value: "<" }, { row: 3, value: "0"}, { row: 3, value: "."}
    ];
    
    let left = "";
    let right = "";
    let decimalsActive = false;

    // Reset amount on component mount (when returning from a transaction)
    onMount(() => {
        $pmtAmt = "0.00";
    });

    function loadInvoice(invoice) {
        $pmtAmt = invoice.total.toFixed(2);
        $selectedMint = invoice.paymentCurrency;
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
        if (detail == "<") {
            if (!decimalsActive) {
                left = left.slice(0, -1);
            } else {
                right = right.slice(0, -1);
                if (right === "") decimalsActive = false;
            }
        } else if (detail == ".") {
            decimalsActive = true;
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

<div class="flex flex-col md:flex-row gap-8">
    <div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
        <div class="card-body p-8 items-center text-center">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Enter Charge Amount</h2>
            <div class="flex items-center space-x-2">
                {#if $selectedMint === "USDC"}
                    <img src={usdcLogo} class="w-10 rounded-full" alt="USDC" />
                {:else if $selectedMint === "SOL"}
                   <img src={solLogo} class="w-10" alt="SOL" />
                {:else if $selectedMint === "BONK"}
                    <img src={bonkLogo} class="w-10 rounded-full" alt="BONK" />
                {/if}
                <input bind:value={$pmtAmt} class="input input-bordered w-48 text-right text-xl font-mono" placeholder="0.00" />
            </div>
            <div class="mt-4 w-full max-w-xs">
                <Keyboard custom="{keys}" on:keydown="{onKeydown}" />
            </div>
            <div class="card-actions justify-center mt-6">
                <button on:click={createQRCode} class="btn btn-primary btn-wide text-white font-greycliffbold normal-case">Create QR Code</button>
            </div>
        </div>
    </div>

    <div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Load from Invoice</h2>
            <div class="overflow-y-auto h-96">
                <table class="table table-zebra w-full">
                    <tbody>
                        {#each $invoices.filter(inv => inv.status === 'Saved') as invoice (invoice.id)}
                        <tr class="hover" on:click={() => loadInvoice(invoice)}>
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
        </div>
    </div>
</div>
