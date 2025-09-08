<script lang='ts'>
    import { onMount } from "svelte";
    import * as web3 from '@solana/web3.js';
    import { createQR, encodeURL, findReference, FindReferenceError} from "@solana/pay"
    import { storeName, publicKey, pmtAmt, mostRecentTxn, showWarning, successArray, mints, selectedMint, inventory, currentChargeItems} from '../stores.js';
    import { logHistory } from '../../utils/inventory.js';
    import { goto } from '$app/navigation';
    import BigNumber from 'bignumber.js';

	let txnConfirmed = false;
    let statusMessage = "Awaiting Payment...";
    const POLLING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    // Reverted to a more stable public RPC endpoint
    let sol_rpc = "https://solana-mainnet.g.alchemy.com/v2/5Bo-yRwJYXcscWQkkah0KJ-9jPmm5cSi";
    let connection = new web3.Connection(sol_rpc);
    const reference = web3.Keypair.generate().publicKey;
    const label = 'Payment to ' + ($storeName || 'store');
    const message = 'Thank you for your payment!';
	const memo = 'Transaction by PoSolana';
    let intervalId;

    onMount(async () => {
        const pmtAmtString = $pmtAmt ? $pmtAmt.toString() : '0';
        const recipient = new web3.PublicKey($publicKey);
        const amount = new BigNumber(pmtAmtString.replace(/,/g, ''));
        
        const currentMint = $mints.find(item => item.name == $selectedMint);

        const urlParams = {
            recipient,
            amount,
            reference,
            label,
            message,
            memo,
        };

        if (currentMint && currentMint.name !== 'SOL') {
            urlParams.splToken = new web3.PublicKey(currentMint.mint);
        }

        const url = encodeURL(urlParams);

        try {
            const qrCode = createQR(url, 360, 'transparent');
            const element = document.getElementById('qr-code');
            if (element) {
                element.innerHTML = '';
                qrCode.append(element);
            }
        } catch (e) {
            console.error("Error creating QR code", e);
        }
        
        const startTime = Date.now();
        intervalId = setInterval(async () => {
            if (Date.now() - startTime > POLLING_TIMEOUT) {
                clearInterval(intervalId);
                statusMessage = "Transaction not found. Please try again.";
                return;
            }

            try {
                const signatureInfo = await findReference(connection, reference, { commitment: 'confirmed' });
                clearInterval(intervalId);
                txnConfirmed = true;
                statusMessage = "Transaction Confirmed!";

                // --- BEGIN INVENTORY UPDATE LOGIC ---
                if ($currentChargeItems && $currentChargeItems.length > 0) {
                    inventory.update(inv => {
                        const newInv = [...inv];
                        for (const soldItem of $currentChargeItems) {
                            // Find the item in our inventory by its unique ID
                            const itemIndex = newInv.findIndex(i => i.id === soldItem.id);
                            if (itemIndex > -1) {
                                const originalQty = newInv[itemIndex].quantity;
                                const newQty = originalQty - soldItem.quantity;
                                newInv[itemIndex].quantity = newQty;

                                // Log the sale to the item's history
                                logHistory(soldItem.id, `Sale (Tx: ${signatureInfo.signature.substring(0, 4)}...)`, `-${soldItem.quantity}`, newQty);
                            }
                        }
                        return newInv;
                    });
                    // Clear the charge items store after processing
                    currentChargeItems.set([]);
                }
                // --- END INVENTORY UPDATE LOGIC ---


                let confirmedTxn = await connection.getParsedTransaction(signatureInfo.signature, "confirmed");
                if (confirmedTxn) {
                    const transferInstruction = confirmedTxn.transaction.message.instructions.find(
                        (instruction) => (instruction as web3.PartiallyDecodedInstruction).parsed?.type === 'transfer' || (instruction as web3.PartiallyDecodedInstruction).parsed?.type === 'transferChecked'
                    ) as web3.PartiallyDecodedInstruction | undefined;
                    
                    let uiAmount = 0;
                    if (transferInstruction?.parsed?.info?.tokenAmount) {
                        uiAmount = transferInstruction.parsed.info.tokenAmount.uiAmount;
                    } else if (transferInstruction?.parsed?.info?.lamports) {
                        uiAmount = transferInstruction.parsed.info.lamports / web3.LAMPORTS_PER_SOL;
                    }

                    if (uiAmount > 0) {
                        const new_entry = {
                            timestamp: confirmedTxn.blockTime,
                            txid: confirmedTxn.transaction.signatures[0],
                            uiAmount: uiAmount,
                            mint: $selectedMint
                        };
                        successArray.update(items => {
                            if (!items.some(item => item.txid === new_entry.txid)) {
                                return [...items, new_entry];
                            }
                            return items;
                        });
                    }
                }
                mostRecentTxn.set(signatureInfo.signature);
            } catch (e) {
                if (e instanceof FindReferenceError) {
                    // This is an expected error when the transaction hasn't been found yet, so we can ignore it.
                    return;
                }
                console.error('An unexpected error occurred:', e);
                statusMessage = "An error occurred. Please check the console.";
                clearInterval(intervalId);
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
    });

    function goBack() {
        goto('/pos');
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
        <div class="card-body p-8 items-center text-center">
            <h1 class="font-greycliffbold text-3xl mb-2">
                {$storeName}
            </h1>

            <div id="qr-code" class="rounded-lg overflow-hidden border border-gray-200 shadow-sm"></div>
		   
		   <div class="mt-4">
               {#if !txnConfirmed && statusMessage !== 'An error occurred. Please check the console.' && statusMessage !== 'Transaction not found. Please try again.'}
                    <div class="flex items-center">
                        <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
						<span>{statusMessage}</span>
                    </div>
                {:else if txnConfirmed}
                    <div class="flex items-center text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="font-bold">{statusMessage}</span>
                    </div>
                {:else}
                    <div class="flex items-center text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{statusMessage}</span>
                    </div>
                {/if}
            </div>

            <div class="card-actions justify-center mt-6">
                <button on:click={goBack} class="btn btn-outline normal-case">
				   {txnConfirmed ? "New Transaction" : "Cancel"}
                </button>
            </div>

            {#if $showWarning}
            <div class="text-xs text-center opacity-70 mt-4">
                <p>This device does not store any cryptocurrency.</p>
            </div>
            {/if}
        </div>
    </div>
</div>
