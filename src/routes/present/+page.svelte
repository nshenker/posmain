<script lang='ts'>
    import { onMount } from "svelte";
    import * as web3 from '@solana/web3.js';
    import { createQR, encodeURL, findReference, FindReferenceError} from "@solana/pay";
    import { storeName, publicKey, pmtAmt, mostRecentTxn, showWarning, successArray, mints, selectedMint, inventory, currentChargeItems, chargeMetadata, selectedCustomer, customers, loyaltyRedemptionRate} from '../stores.js';
    // Import customers store and loyaltyRedemptionRate
    import { tokenPrices } from '../priceStore.js';
    // Import tokenPrices store
    import { logHistory } from '../../utils/inventory.js';
    import { goto } from '$app/navigation';
    import BigNumber from 'bignumber.js';
    import { get } from 'svelte/store';
    import { showToast } from '../toastStore.js';
    // Import showToast

	let txnConfirmed = false;
    let statusMessage = "Awaiting Payment...";
    const POLLING_TIMEOUT = 5 * 60 * 1000;
    // 5 minutes

    // NEW: Define constants for the specific error messages to avoid multi-line string issues
    // FIX: Changed single quotes to backticks for multi-line string
    const ERROR_MSG_CONSOLE = `An error occurred.
Please check the console.`;
    const ERROR_MSG_NOT_FOUND = 'Transaction not found. Please try again.';
    // Reverted to a more stable public RPC endpoint
    let sol_rpc = "https://solana-mainnet.g.alchemy.com/v2/5Bo-yRwJYXcscWQkkah0KJ-9jPmm5cSi";
    let connection;
    let intervalId;
    onMount(async () => {
        // --- Start of browser-specific setup ---
        connection = new web3.Connection(sol_rpc);
        const reference = web3.Keypair.generate().publicKey;
        const label = 'Payment to ' + ($storeName || 'store');
        const message = 'Thank you for your payment!';
        const memo = 'Transaction by PoSolana';
        // --- End of 
        // browser-specific setup ---
 
        // 1. Get UI amount string and clean it
        const pmtAmtString = $pmtAmt ? $pmtAmt.toString().replace(/,/g, '') : '0';
        
        // 2. Determine Recipient and Mint Info
        const recipient = new web3.PublicKey($publicKey);
        const currentMint = $mints.find(item => item.name == $selectedMint);

        // 3. FIX: Calculate the amount in RAW integer units using decimals from the store
        // The previous issue was passing the UI float amount directly.
        const decimals = currentMint ? currentMint.decimals : 6; // Default to 6 (USDC)
        const amount = new BigNumber(pmtAmtString).multipliedBy(new BigNumber(10).pow(decimals));

        
        const urlParams: any = {
            recipient,
            amount,
            reference,
            label,
            message,
            memo,
        };

        
        // 4. Set splToken public key for non-SOL payments
        if (currentMint && 
        
        currentMint.name !== 'SOL') {
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
                statusMessage = ERROR_MSG_NOT_FOUND; // MODIFIED
                return;
            }

          

   
            try {
                const signatureInfo = await findReference(connection, reference, { commitment: 'confirmed' });
                clearInterval(intervalId);
                txnConfirmed = true;
                statusMessage = "Transaction Confirmed!";

         
   
                let confirmedTxn =
 
                    await 
                    connection.getParsedTransaction(signatureInfo.signature, "confirmed");

				if (confirmedTxn) {
                    let uiAmount = 0;
                    const meta = 
                        confirmedTxn.meta;
   
                
          
                    // FIX: Use the already created PublicKey object for consistency
                    const pubkey = recipient;
                    
       
   
          
                    const mintsArray = get(mints);
                    const currentMintInfo = mintsArray.find(m => m.name === $selectedMint);
                    if (meta) {
                        if ($selectedMint !== 'SOL' && currentMintInfo) {
                            // Method 1: Check SPL token balance changes (most reliable for SPL tokens)
                    
 
        
                            const preBalance = meta.preTokenBalances?.find(
                                b => b.owner === pubkey.toBase58() && b.mint === currentMintInfo.mint
                     
 
       )?.uiTokenAmount?.uiAmount ??
                            0;
                            const postBalance = meta.postTokenBalances?.find(
                                b => b.owner === pubkey.toBase58() && b.mint === currentMintInfo.mint
                            )?.uiTokenAmount?.uiAmount ??
                            0;

                            if (postBalance > preBalance) {
                                uiAmount = postBalance - preBalance;
                            }
                        } else {
                            // Method 2: Check native SOL balance changes
                            const accountIndex = confirmedTxn.transaction.message.accountKeys.findIndex(
        

                                key => key.pubkey.toBase58() === pubkey.toBase58()
                            );
                            if (accountIndex !== -1 && meta.preBalances && meta.postBalances) {
                                const preBalance = meta.preBalances[accountIndex];
                                const postBalance = meta.postBalances[accountIndex];
                                if (postBalance > preBalance) {
                                    uiAmount = (postBalance - preBalance) / web3.LAMPORTS_PER_SOL;
                                }
                            }
                        }
                    }

                    // Method 3: Robust fallback by checking all
 
                    // instructions (top-level and inner)
                    if (uiAmount === 0 || isNaN(uiAmount)) {
                        
                        const isSol = 
                        $selectedMint === 'SOL';
                        const pubkeyString = pubkey.toBase58();
                        
                        // Combine top-level and all inner instructions for a robust search
                        const instructionsToSearch = confirmedTxn.transaction.message.instructions.concat(
                            meta.innerInstructions?.flatMap(i => i.instructions) || []
                        
                        );
                        for (const instruction of instructionsToSearch) {
                            const parsedInstruction = (instruction as web3.PartiallyDecodedInstruction).parsed;
                            if (parsedInstruction && (parsedInstruction.type === 'transfer' || parsedInstruction.type === 'transferChecked')) {
                                const info = parsedInstruction.info;
                                // For SOL, check for transfer to the merchant's wallet (pubkey)
                                if (isSol && info.destination?.toString() === pubkeyString && info.lamports) {
                                    uiAmount = info.lamports / web3.LAMPORTS_PER_SOL;
                                    break;
                                }
                                
                                // For SPL, handle both transferChecked (uiAmount) and simple transfer (raw amount)
                        
 
        if (!isSol && currentMintInfo) {
                                    let amountFound = 0;
                                    // 1. Try transferChecked (uses uiAmount, most robust)
                                    if (parsedInstruction.type === 'transferChecked' && info.tokenAmount && info.tokenAmount.uiAmount > 0 && info.mint === currentMintInfo.mint) {
                                        amountFound = info.tokenAmount.uiAmount;
                                    }
                                    // 2. Fallback for simple transfer (uses raw amount string)
                                    else if (parsedInstruction.type === 'transfer' && info.amount) {
            
 
                            // info.amount is in lamports, need to convert to uiAmount
                                        const decimals = currentMintInfo.decimals ||
                                        6;
                                        amountFound = parseFloat(info.amount) / Math.pow(10, decimals);
                                    }
                                    
                                    if (amountFound > 0) {
                 
 
                       uiAmount = amountFound;
                                        break;
                                    }
                                }
                            }
                        }
               
 
     }

                    // --- LOYALTY POINTS CALCULATION (AWARDING) ---
                    let pointsEarned = 0;
                    if (uiAmount > 0 && $selectedCustomer) {
                        const prices = get(tokenPrices);
                        let usdValue = 0;
                        if ($selectedMint === 'USDC' || $selectedMint === 'USD') {
                            usdValue = uiAmount;
                        } else if (currentMintInfo && prices[currentMintInfo.coingeckoId]?.usd) {
                            usdValue = uiAmount * prices[currentMintInfo.coingeckoId].usd;
                        }
                        pointsEarned = Math.floor(usdValue);
                        // 1 point per dollar
                    }
                    // --- END LOYALTY POINTS CALCULATION (AWARDING) ---


                    if (uiAmount > 0) {
                        const 
 
                        chargeMeta 
 
                            = get(chargeMetadata);
                        const new_entry = {
                            txnId: Date.now().toString(), // <--- ADDED: Unique internal transaction ID
                            timestamp: confirmedTxn.blockTime,
                            txid: confirmedTxn.transaction.signatures[0], // <--- 
 
                            // RETAIN: External Solana Signature
                            uiAmount: uiAmount,
                            mint: $selectedMint,
          
                            // Ensure items are clean, serializable objects
     

                            items: JSON.parse(JSON.stringify($currentChargeItems)),
                            subtotal: chargeMeta?.subtotal,
             
                            taxAmount: chargeMeta?.taxAmount,
             
     
                            taxRate: chargeMeta?.taxRate,
                            taxable: 
        
                            chargeMeta?.applyTax,
     
                       
                            customerId: $selectedCustomer ?
                            $selectedCustomer.id : null,
                            // --- NEW: Add loyalty redemption details to the transaction record ---
                            loyaltyDiscountAmount: chargeMeta?.loyaltyDiscountAmount ||
                            0,
                            pointsRedeemed: chargeMeta?.pointsRedeemed ||
                            0,
                            // MODIFIED: Add order discount details
                            orderDiscountAmount: chargeMeta?.orderDiscountAmount ||
                            0,
                            orderDiscountCode: chargeMeta?.orderDiscountCode ||
                            null
                        };
                        successArray.update(items => {
                            if (!items.some(item => item.txid === new_entry.txid)) {
                                return [...items, new_entry];
                            }
  
 

                            return items;
                        });
                        // --- LOYALTY POINTS DEDUCTION AND AWARDING ---
                        if ($selectedCustomer) {
                            let pointsChange = 0;
                            const redemptionRate = get(loyaltyRedemptionRate);
                            
                            // 1. DEDUCTION
                            if (chargeMeta?.isRedeeming && new_entry.pointsRedeemed > 0) {
                                pointsChange -= new_entry.pointsRedeemed;
                                showToast(`Redeemed ${new_entry.pointsRedeemed} points for discount!`, 'info');
                            }
                            
                            // 2. AWARDING (pointsEarned calculated above)
                            // Points are awarded on 
 
                            // the FINAL amount spent (uiAmount) converted to USD *before* discount.
                            // The logic here is simplified to: (Subtotal + Tax) - Discount
                            let usdValueForAward = 0;
                            if (new_entry.subtotal && new_entry.taxAmount) {
                                // This is the preferred method: pre-discount subtotal/tax are available
                                // MODIFIED: Include orderDiscountAmount
                    
                                usdValueForAward = new_entry.subtotal - new_entry.orderDiscountAmount + new_entry.taxAmount - new_entry.loyaltyDiscountAmount;
                            } else {
                                // Fallback: Use the final uiAmount and convert to USD
                                const prices = get(tokenPrices);
                                let cryptoPrice = 1; 
                                if ($selectedMint !== 'USDC' && $selectedMint !== 'USD' && currentMintInfo && prices[currentMintInfo.coingeckoId]?.usd) {
                                    cryptoPrice = prices[currentMintInfo.coingeckoId].usd;
                                }
                                usdValueForAward = new_entry.uiAmount * cryptoPrice;
                            }

                            const finalPointsAwarded = Math.floor(Math.max(0, usdValueForAward));
                            pointsChange += finalPointsAwarded;


                            if (finalPointsAwarded > 0) {
                                showToast(`Awarded ${finalPointsAwarded} loyalty points!`, 'success');
                            }

                            if (pointsChange !== 0) {
                                customers.update(allCustomers => {
                                  
 
                                return allCustomers.map(cust => 
 
                                        {
                                        if (cust.id === $selectedCustomer.id) {
          
 
              
                                            return {
                                         
 
       ...cust,
                                           
                                                loyaltyPoints: Math.max(0, 
 
(cust.loyaltyPoints || 0) + pointsChange)
                                              };
                                        }
          
 
      
                                        return cust;
                                        });
             
 
                   });
                                // Update the selectedCustomer store directly
                                selectedCustomer.update(cust => ({
                                    ...cust,
                         
 
           loyaltyPoints: Math.max(0, (cust.loyaltyPoints || 0) + pointsChange)
                                }));
                            }
                        }
                        // --- END LOYALTY POINTS DEDUCTION AND AWARDING ---
                    }
                }

        
 
        // --- BEGIN INVENTORY UPDATE LOGIC ---
       
                if ($currentChargeItems && $currentChargeItems.length > 0) {
                    inventory.update(inv => {
                        const newInv = [...inv];
						for (const soldItem of $currentChargeItems) {
   
 
                         const itemIndex = 
 
                                newInv.findIndex(i => i.id === soldItem.id);
							if (itemIndex > -1) {
                               
 
                                if (newInv[itemIndex].type === 'simple') {
                        
                                    const originalQty = newInv[itemIndex].quantity;
								    const newQty 
                          
 
              = originalQty - soldItem.quantity;
                                    
                                    newInv[itemIndex].quantity = newQty;
         
 
                           logHistory(soldItem.id, `Sale (Tx: ${signatureInfo.signature.substring(0, 4)}...)`, `-${soldItem.quantity}`, newQty);
                                } else if (newInv[itemIndex].type === 'variable' && soldItem.variantId) {
                                    const variantIndex = newInv[itemIndex].variants.findIndex(v => 
                                        v.id ===
          
 

                                        soldItem.variantId);
                                    if (variantIndex > -1) {
                                        const variant = newInv[itemIndex].variants[variantIndex];
                                        const newVariantQty = variant.quantity - soldItem.quantity;
                                        newInv[itemIndex].variants[variantIndex].quantity = newVariantQty;
                                        newInv[itemIndex].quantity = newInv[itemIndex].variants.reduce((total, v) => total + v.quantity, 0);
                                        logHistory(variant.id, `Sale (Tx: ${signatureInfo.signature.substring(0, 4)}...)`, `-${soldItem.quantity}`, newVariantQty);
                                    }
                                }
							}
                        }
                        return newInv;
                        });
                }
                // --- END INVENTORY UPDATE LOGIC ---

                mostRecentTxn.set(signatureInfo.signature);
                // Clear the cart only after all processing is complete
                currentChargeItems.set([]);
                chargeMetadata.set(null);
            } catch (e) {
                if (e instanceof FindReferenceError) {
					return;
                }
                console.error('An unexpected error occurred:', e);
                statusMessage = ERROR_MSG_CONSOLE; // MODIFIED: Use the constant defined earlier
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
      

                {#if !txnConfirmed && statusMessage !== ERROR_MSG_CONSOLE && statusMessage !== ERROR_MSG_NOT_FOUND}
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
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 
9 9 0 0118 0z" />
                     
                        </svg>
						<span class="font-bold">{statusMessage}</span>
                    </div>
      
                    {:else}
             
                    <div class="flex items-center text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round"
    
                            stroke-width="2" d="M10 
                            14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         
               <span>{statusMessage}</span>
                    </div>
                
                    {/if}
			</div>

      
                   <div class="card-actions justify-center mt-6">
              
                          <button on:click={goBack} class="btn btn-outline normal-case">
				   {txnConfirmed ?
                           "New Transaction" : "Cancel"}
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
