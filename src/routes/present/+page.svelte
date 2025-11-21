<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { storeName, publicKey, pmtAmt, mostRecentTxn, showWarning, successArray, mints, selectedMint, inventory, currentChargeItems, chargeMetadata, selectedCustomer, customers, loyaltyRedemptionRate} from '../stores.js';
    import { tokenPrices } from '../priceStore.js';
    import { logHistory } from '../../utils/inventory.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import { showToast } from '../toastStore.js';

    let txnConfirmed = false;
    let statusMessage = "Initializing Payment...";
    const POLLING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    const ERROR_MSG_CONSOLE = 'An error occurred. Please check the console.';
    const ERROR_MSG_NOT_FOUND = 'Transaction not found. Please try again.';
    
    // RPC Endpoint
    let sol_rpc = "https://solana-mainnet.g.alchemy.com/v2/5Bo-yRwJYXcscWQkkah0KJ-9jPmm5cSi";
    
    // Library variables
    let web3, createQR, encodeURL, findReference, FindReferenceError, BigNumber;
    let connection;
    let intervalId;

    onMount(async () => {
        try {
            // DYNAMIC IMPORT: Ensures we use the correct browser-compatible versions
            const solanaWeb3 = await import('@solana/web3.js');
            const solanaPay = await import('@solana/pay');
            const BigNumberLib = await import('bignumber.js');

            web3 = solanaWeb3;
            createQR = solanaPay.createQR;
            encodeURL = solanaPay.encodeURL;
            findReference = solanaPay.findReference;
            FindReferenceError = solanaPay.FindReferenceError;
            BigNumber = BigNumberLib.default || BigNumberLib;

            statusMessage = "Awaiting Payment...";
            connection = new web3.Connection(sol_rpc);

            // 1. Validate Wallet Address
            let recipient;
            try {
                recipient = new web3.PublicKey($publicKey);
            } catch (err) {
                showToast("Invalid Merchant Wallet Address. Check Settings.", "error");
                statusMessage = "Config Error: Invalid Wallet";
                return;
            }
            
            // 2. STRICT Amount Formatting
            const pmtAmtString = $pmtAmt ? $pmtAmt.toString().replace(/,/g, '') : '0';
            const currentMint = $mints.find(item => item.name == $selectedMint);
            
            // Default to 9 decimals (SOL) if mint not found, otherwise use mint decimals (USDC = 6)
            const decimals = currentMint ? currentMint.decimals : 9; 

            // Create BigNumber from string
            let rawAmount = new BigNumber(pmtAmtString);
            
            // Round DOWN to the exact decimals allowed by the token.
            const safeAmountStr = rawAmount.toFixed(decimals, BigNumber.ROUND_DOWN); 
            const amount = new BigNumber(safeAmountStr);

            if (amount.lte(0)) {
                showToast("Invalid Amount.", "error");
                statusMessage = "Invalid Amount";
                return;
            }

            // 3. Construct URL Parameters
            const reference = web3.Keypair.generate().publicKey;
            
            // Sanitize Label
            let safeLabel = ($storeName || 'Store').replace(/[^a-zA-Z0-9 ]/g, ""); 
            if (safeLabel.length > 20) safeLabel = safeLabel.substring(0, 20);

            const urlParams: any = {
                recipient,
                amount,
                reference,
                label: safeLabel,
                message: 'Payment',
            };

            // Only add splToken parameter if it is NOT native SOL
            if (currentMint && currentMint.name !== 'SOL') {
                urlParams.splToken = new web3.PublicKey(currentMint.mint);
            }

            // 4. Generate URL
            const url = encodeURL(urlParams);
            
            try {
                // Use 'white' background for maximum contrast
                const qrCode = createQR(url, 360, 'white');
                const element = document.getElementById('qr-code');
                if (element) {
                    element.innerHTML = '';
                    qrCode.append(element);
                }
            } catch (e) {
                console.error("Error creating QR code", e);
                statusMessage = "Error generating QR Code";
            }

            // 5. Start Polling
            const startTime = Date.now();
            intervalId = setInterval(async () => {
                if (Date.now() - startTime > POLLING_TIMEOUT) {
                    clearInterval(intervalId);
                    statusMessage = ERROR_MSG_NOT_FOUND;
                    return;
                }

                try {
                    const signatureInfo = await findReference(connection, reference, { commitment: 'confirmed' });
                    
                    clearInterval(intervalId);
                    txnConfirmed = true;
                    statusMessage = "Transaction Confirmed!";

                    let confirmedTxn = await connection.getParsedTransaction(signatureInfo.signature, "confirmed");

                    if (confirmedTxn) {
                        // ... (Standard Transaction parsing logic) ...
                        let uiAmount = 0;
                        const meta = confirmedTxn.meta;
                        const pubkey = recipient;
                        const mintsArray = get(mints);
                        const currentMintInfo = mintsArray.find(m => m.name === $selectedMint);

                        if (meta) {
                            if ($selectedMint !== 'SOL' && currentMintInfo) {
                                const preBalance = meta.preTokenBalances?.find(b => b.owner === pubkey.toBase58() && b.mint === currentMintInfo.mint)?.uiTokenAmount?.uiAmount ?? 0;
                                const postBalance = meta.postTokenBalances?.find(b => b.owner === pubkey.toBase58() && b.mint === currentMintInfo.mint)?.uiTokenAmount?.uiAmount ?? 0;
                                if (postBalance > preBalance) uiAmount = postBalance - preBalance;
                            } else {
                                const accountIndex = confirmedTxn.transaction.message.accountKeys.findIndex(key => key.pubkey.toBase58() === pubkey.toBase58());
                                if (accountIndex !== -1 && meta.preBalances && meta.postBalances) {
                                    const preBalance = meta.preBalances[accountIndex];
                                    const postBalance = meta.postBalances[accountIndex];
                                    if (postBalance > preBalance) uiAmount = (postBalance - preBalance) / web3.LAMPORTS_PER_SOL;
                                }
                            }
                        }

                        if (uiAmount === 0 || isNaN(uiAmount)) {
                             uiAmount = parseFloat(safeAmountStr); // Fallback
                        }

                        if (uiAmount > 0) {
                            const chargeMeta = get(chargeMetadata);
                            const new_entry = {
                                txnId: Date.now().toString(),
                                timestamp: confirmedTxn.blockTime,
                                txid: confirmedTxn.transaction.signatures[0],
                                uiAmount: uiAmount,
                                mint: $selectedMint,
                                items: JSON.parse(JSON.stringify($currentChargeItems)),
                                subtotal: chargeMeta?.subtotal,
                                taxAmount: chargeMeta?.taxAmount,
                                taxRate: chargeMeta?.taxRate,
                                taxable: chargeMeta?.applyTax,
                                customerId: $selectedCustomer ? $selectedCustomer.id : null,
                                loyaltyDiscountAmount: chargeMeta?.loyaltyDiscountAmount || 0,
                                pointsRedeemed: chargeMeta?.pointsRedeemed || 0,
                                orderDiscountAmount: chargeMeta?.orderDiscountAmount || 0,
                                orderDiscountCode: chargeMeta?.orderDiscountCode || null
                            };
                            
                            successArray.update(items => {
                                if (!items.some(item => item.txid === new_entry.txid)) {
                                    return [...items, new_entry];
                                }
                                return items;
                            });

                            if ($selectedCustomer) {
                                let pointsChange = 0;
                                const redemptionRate = get(loyaltyRedemptionRate);
                                if (chargeMeta?.isRedeeming && new_entry.pointsRedeemed > 0) {
                                    pointsChange -= new_entry.pointsRedeemed;
                                    showToast(`Redeemed ${new_entry.pointsRedeemed} points!`, 'info');
                                }
                                let usdValueForAward = 0;
                                if (new_entry.subtotal && new_entry.taxAmount) {
                                    usdValueForAward = new_entry.subtotal - new_entry.orderDiscountAmount + new_entry.taxAmount - new_entry.loyaltyDiscountAmount;
                                } else {
                                    const prices = get(tokenPrices);
                                    let cryptoPrice = 1;
                                    if ($selectedMint !== 'USDC' && $selectedMint !== 'USD' && currentMintInfo && prices[currentMintInfo.coingeckoId]?.usd) {
                                        cryptoPrice = prices[currentMintInfo.coingeckoId].usd;
                                    }
                                    usdValueForAward = new_entry.uiAmount * cryptoPrice;
                                }
                                const finalPointsAwarded = Math.floor(Math.max(0, usdValueForAward));
                                pointsChange += finalPointsAwarded;
                                if (finalPointsAwarded > 0) showToast(`Awarded ${finalPointsAwarded} points!`, 'success');

                                if (pointsChange !== 0) {
                                    customers.update(all => all.map(c => c.id === $selectedCustomer.id ? { ...c, loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) + pointsChange) } : c));
                                    selectedCustomer.update(c => ({ ...c, loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) + pointsChange) }));
                                }
                            }

                            // --- INVENTORY DEDUCTION LOGIC ---
                            const chargeItems = get(currentChargeItems);
                            if (chargeItems && chargeItems.length > 0) {
                                inventory.update(inv => {
                                    const newInv = [...inv];
                                    for (const soldItem of chargeItems) {
                                        // Skip custom manual items that aren't in inventory
                                        if (soldItem.id.startsWith('custom-')) continue;

                                        const itemIndex = newInv.findIndex(i => i.id === soldItem.id);
                                        if (itemIndex > -1) {
                                            if (newInv[itemIndex].type === 'simple') {
                                                const newQty = newInv[itemIndex].quantity - soldItem.quantity;
                                                newInv[itemIndex].quantity = newQty;
                                                logHistory(soldItem.id, `Sale (Tx: ${signatureInfo.signature.substring(0, 4)}...)`, `-${soldItem.quantity}`, newQty);
                                            } else if (newInv[itemIndex].type === 'variable' && soldItem.variantId) {
                                                const variantIndex = newInv[itemIndex].variants.findIndex(v => v.id === soldItem.variantId);
                                                if (variantIndex > -1) {
                                                    const newVariantQty = newInv[itemIndex].variants[variantIndex].quantity - soldItem.quantity;
                                                    newInv[itemIndex].variants[variantIndex].quantity = newVariantQty;
                                                    // Recalculate total quantity for the parent item
                                                    newInv[itemIndex].quantity = newInv[itemIndex].variants.reduce((total, v) => total + v.quantity, 0);
                                                    logHistory(newInv[itemIndex].variants[variantIndex].id, `Sale (Tx: ${signatureInfo.signature.substring(0, 4)}...)`, `-${soldItem.quantity}`, newVariantQty);
                                                }
                                            }
                                        }
                                    }
                                    return newInv;
                                });
                            }
                            // --- END INVENTORY LOGIC ---
                            
                            mostRecentTxn.set(signatureInfo.signature);
                            currentChargeItems.set([]);
                            chargeMetadata.set(null);
                        }
                    }
                } catch (e) {
                    if (!(e instanceof FindReferenceError)) {
                        console.error('An unexpected error occurred:', e);
                        statusMessage = ERROR_MSG_CONSOLE;
                        clearInterval(intervalId);
                    }
                }
            }, 2000);

        } catch (error) {
            console.error("Failed to initialize payment libraries:", error);
            statusMessage = "System Error: Reload Page";
            showToast("Critical Error loading payment system.", "error");
        }
    });

    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
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

            <div id="qr-code" class="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white p-2 min-h-[360px] flex items-center justify-center">
                {#if statusMessage === "Initializing Payment..."}
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                {/if}
            </div>

		   <div class="mt-4">
                {#if !txnConfirmed && statusMessage !== ERROR_MSG_CONSOLE && statusMessage !== ERROR_MSG_NOT_FOUND}
                    <div class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
						<span>{statusMessage}</span>
                    </div>
                {:else if txnConfirmed}
                    <div class="flex items-center justify-center text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
						<span class="font-bold">{statusMessage}</span>
                    </div>
                {:else}
                    <div class="flex items-center justify-center text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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
