<script lang='ts'>
    import { onMount, onDestroy, tick } from "svelte";
    import { goto } from '$app/navigation';
    import { pmtAmt, selectedMint, currentChargeItems, inventory } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import Keyboard from "svelte-keyboard";
    import { browser } from '$app/environment';
    import { Html5QrcodeScanner } from 'html5-qrcode';
    import bonkLogo from "../../lib/images/BonkLogo.png";
    import solLogo from "../../lib/images/solanaLogoMark.png";
    import InventoryModal from "./InventoryModal.svelte";
    import hntLogo from "../../lib/images/HNTLogo.png";

    let showInventoryModal = false;
    let chargeItems = [];
    let barcodeInput = '';
    
    // --- Scanner State ---
    let scanner = null;
    let isScannerVisible = false; // Controls the visibility of the scanner UI
    let lastScanTime = 0;
    let lastScanResult = '';
    const SCAN_COOLDOWN = 3000; // 3 seconds


    const keys = [
        { row: 0, value: "1"}, { row: 0, value: "2"}, { row: 0, value: "3"}, 
        { row: 1, value: "4"}, { row: 1, value: "5"}, { row: 1, value: "6"},
        { row: 2, value: "7"}, { row: 2, value: "8"}, { row: 2, value: "9"},
        { row: 3, value: "<" }, { row: 3, value: "0"}, { row: 3, value: "."}
    ];
    
    // Numpad state
    let left = "";
    let right = "";
    let decimalsActive = false;

    // --- Functions for adding items ---
    function addItemToCart(itemToAdd) {
        if (!itemToAdd) {
            showToast('Item not found in inventory.', 'error');
            return;
        }

        if (chargeItems.length === 0) {
            $selectedMint = itemToAdd.currency;
        } 
        else if (itemToAdd.currency !== $selectedMint) {
            showToast('All items in a charge must have the same currency.', 'error');
            return;
        }

        const existingItemIndex = chargeItems.findIndex(i => i.id === itemToAdd.id);
        if (existingItemIndex > -1) {
            chargeItems[existingItemIndex].quantity += 1;
        } else {
            chargeItems.push({ ...itemToAdd, quantity: 1 });
        }
        
        chargeItems = chargeItems; // Trigger reactivity
    }


    function handleAddItemFromModal(event) {
        addItemToCart(event.detail);
        showInventoryModal = false;
    }

    function addItemByBarcode(barcode) {
        const item = $inventory.find(i => i.barcode === barcode.trim());
        if (item) {
            addItemToCart(item);
            showToast(`Added: ${item.name}`, 'success');
        } else {
            showToast(`Barcode "${barcode}" not found.`, 'error');
        }
    }

    function handleBarcodeSubmit() {
        if (barcodeInput.trim()) {
            addItemByBarcode(barcodeInput);
            barcodeInput = ''; // Clear input after scan
        }
    }
    
    // --- Camera Scanner Logic ---
    function onScanSuccess(decodedText) {
        const now = Date.now();
        // Cooldown logic: if the same code is scanned within the cooldown period, ignore it.
        if (decodedText === lastScanResult && (now - lastScanTime < SCAN_COOLDOWN)) {
            return;
        }
        
        lastScanTime = now;
        lastScanResult = decodedText;
        
        addItemByBarcode(decodedText);
    }

    function onScanFailure(error) { /* Ignore failures to allow continuous scanning */ }

    async function startScanner() {
        isScannerVisible = true;
        // Wait for the DOM to update so the "reader" div is visible
        await tick();

        // This function makes the scanning box responsive
        const qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
            let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            let qrboxSize = Math.floor(minEdge * 0.8);
            return {
                width: qrboxSize,
                height: qrboxSize
            };
        }

        try {
            scanner = new Html5QrcodeScanner(
                "reader",
                { 
                    fps: 10, 
                    qrbox: qrboxFunction,
                    useBarCodeDetectorIfSupported: true // Improves performance
                },
                false // verbose
            );
            await scanner.render(onScanSuccess, onScanFailure);
        } catch (err) {
            console.error("Error rendering scanner:", err);
            showToast("Could not start camera. Check permissions.", "error");
            isScannerVisible = false;
        }
    }

    function stopScanner() {
        if (scanner) {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode-scanner.", error);
            });
            scanner = null;
        }
        isScannerVisible = false;
    }


    // --- Functions for charge management ---
    function removeItem(itemId) {
        chargeItems = chargeItems.filter(i => i.id !== itemId);
        if (chargeItems.length === 0) {
            clearCharge();
        }
    }

    function incrementQuantity(itemId) {
        const itemIndex = chargeItems.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            chargeItems[itemIndex].quantity += 1;
            chargeItems = chargeItems;
        }
    }

    function decrementQuantity(itemId) {
        const itemIndex = chargeItems.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            if (chargeItems[itemIndex].quantity > 1) {
                chargeItems[itemIndex].quantity -= 1;
                chargeItems = chargeItems;
            } else {
                removeItem(itemId);
            }
        }
    }

    function clearCharge() {
        chargeItems = [];
        $pmtAmt = "0.00";
        left = "";
        right = "";
        decimalsActive = false;
        $currentChargeItems = [];
    }

    onMount(() => {
        clearCharge();
    });
    
    onDestroy(() => {
        stopScanner(); // Ensure camera is released when leaving the page
    });

    // --- Reactive total calculation ---
    $: {
        if (chargeItems.length > 0) {
            const total = chargeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            $pmtAmt = total.toLocaleString("en", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4 
            });
            const firstItem = chargeItems[0];
            if (firstItem && $selectedMint !== firstItem.currency) {
                $selectedMint = firstItem.currency;
            }
        } else {
             // Reset to manual entry mode if cart is empty
            const fullAmount = `${left || '0'}${right ? '.' + right : ''}`;
            $pmtAmt = parseFloat(fullAmount).toLocaleString("en", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4 
            });
        }
    }

    function createQRCode() {
        if (parseFloat($pmtAmt.replace(/,/g, '')) > 0) {
            $currentChargeItems = chargeItems; // Save cart to store before navigating
            goto('/present');
        } else {
            if(browser) showToast("Please enter an amount greater than zero.", "error");
        }
	}

    const onKeydown = (event) => {
        const detail = event.detail;
        if ($pmtAmt === "0.00" && detail !== ".") left = "";
        if (detail === "<") {
            if (decimalsActive) {
                right = right.slice(0, -1);
                if (right === "") decimalsActive = false;
            } else {
                left = left.slice(0, -1);
            }
        } else if (detail === ".") {
            if (!decimalsActive) decimalsActive = true;
        } else {
            if (!decimalsActive) {
                left += detail;
            } else if (right.length < 4) {
                right += detail;
            }
        }
    }
</script>

{#if showInventoryModal}
    <InventoryModal 
        currentCurrency={chargeItems.length > 0 ? $selectedMint : null}
        on:addItem={handleAddItemFromModal} 
        on:close={() => showInventoryModal = false} 
    />
{/if}


<div class="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8 items-center text-center">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Create Charge</h2>
        
        <div class="w-full max-w-xs">
            <form on:submit|preventDefault={handleBarcodeSubmit} class="input-group">
                <input type="text" placeholder="Scan Barcode..." class="input input-bordered w-full" bind:value={barcodeInput} />
                <button type="submit" class="btn btn-square">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
            </form>
        </div>
        
        <div class="w-full max-w-xs mt-2">
            {#if !isScannerVisible}
                <button on:click={startScanner} class="btn btn-outline btn-sm w-full">
                    Camera Scan
                </button>
            {/if}
            
            <div class:hidden={!isScannerVisible}>
                <div id="reader" class="w-full border-2 border-dashed rounded-lg overflow-hidden"></div>
                <button on:click={stopScanner} class="btn btn-error btn-sm mt-2 w-full">End Scan</button>
            </div>
        </div>

         <div class="divider text-xs">OR</div>

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
            {:else if $selectedMint === "HNT"}
                <img src={hntLogo} class="w-10" alt="HNT" />
            {/if}
            <input bind:value={$pmtAmt} class="input input-bordered w-48 text-right text-xl font-mono" placeholder="0.00" readonly={chargeItems.length > 0} />
        </div>
        
        {#if chargeItems.length === 0}
            <div class="mt-4 w-full max-w-xs">
                <Keyboard custom="{keys}" on:keydown="{onKeydown}" />
            </div>
        {:else}
            <div class="mt-4 w-full max-w-xs space-y-2 text-left">
                <h3 class="font-greycliffmed text-lg text-center">Current Charge</h3>
                {#each chargeItems as item (item.id)}
                    <div class="grid grid-cols-4 gap-2 items-center">
                        <span class="col-span-2 truncate">{item.name}</span>
                        <div class="col-span-1 flex items-center justify-center space-x-1">
                            <button on:click={() => decrementQuantity(item.id)} class="btn btn-xs btn-ghost">-</button>
                            <span>{item.quantity}</span>
                            <button on:click={() => incrementQuantity(item.id)} class="btn btn-xs btn-ghost">+</button>
                        </div>
                        <span class="col-span-1 text-right font-mono">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                {/each}
                <div class="divider"></div>
                <div class="flex justify-between font-bold">
                    <span>Total</span>
                    <span class="font-mono">{$pmtAmt} {$selectedMint}</span>
                </div>
            </div>
        {/if}
        
        <div class="card-actions justify-center mt-6 w-full">
            <div class="flex flex-col space-y-2 w-full max-w-xs">
                <div class="flex space-x-2">
                    <button on:click={() => showInventoryModal = true} class="btn btn-secondary normal-case flex-1">Add Item</button>
                    {#if chargeItems.length > 0}
                        <button on:click={clearCharge} class="btn btn-warning normal-case">Clear</button>
                    {/if}
                </div>
                 <button on:click={createQRCode} class="btn btn-primary text-white font-greycliffbold normal-case w-full">Create QR Code</button>
            </div>
        </div>
    </div>
</div>
