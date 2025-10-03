<script lang='ts'>
    import { onMount, onDestroy, tick } from "svelte";
    import { goto } from '$app/navigation';
    import { pmtAmt, selectedMint, currentChargeItems, inventory, taxRate, defaultTaxable, chargeMetadata } from '../stores.js';
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
    let applyTax = $defaultTaxable;

    // --- Scanner State ---
    let scanner = null;
    let isScannerVisible = false;
    let lastScanTime = 0;
    let lastScanResult = '';
    const SCAN_COOLDOWN = 3000; // 3 seconds


    const keys = [
        { row: 0, value: "1"}, { row: 0, value: "2"}, { row: 0, value: "3"}, 
        { row: 1, value: "4"}, { row: 1, value: "5"}, { row: 1, value: "6"},
        { row: 2, value: "7"}, { row: 2, value: "8"}, { row: 2, value: "9"},
        { row: 3, value: "<" }, { row: 3, value: "0"}, { 
            
            row: 3, value: "."}
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

        // Use variantId for uniqueness if it exists, otherwise use the parent item id
        const uniqueId = itemToAdd.variantId || itemToAdd.id;
        const existingItemIndex = chargeItems.findIndex(i => (i.variantId || i.id) === uniqueId);
        
        if (existingItemIndex > -1) {
            chargeItems[existingItemIndex].quantity += 1;
        } else {
            chargeItems.push({ ...itemToAdd, quantity: 1 });
        }
        
        chargeItems = chargeItems;
        // Trigger reactivity
    }


    function handleAddItemFromModal(event) {
        addItemToCart(event.detail);
        showInventoryModal = false;
    }

    function addItemByBarcode(barcode) {
        let foundItem = null;
        let foundVariant = null;

        // Iterate through the inventory to find the item/variant
        for (const item of $inventory) {
            if (item.type === 'simple' && item.barcode === barcode.trim()) {
                foundItem = item;
                break; // Exit loop once found
            } else if (item.type === 'variable' && item.variants) {
                foundVariant = item.variants.find(v => v.barcode === barcode.trim());
                if (foundVariant) {
                    foundItem = item; // We found the parent item
                    break; // Exit loop once found
                }
            }
        }

        if (foundItem) {
            if (foundVariant) {
                // It's a variant, construct the specific object for the cart
                const itemToAdd = {
                    id: foundItem.id, // Parent ID is still the main reference
                    variantId: foundVariant.id, // Variant ID is crucial for stock depletion
                    name: `${foundItem.name} - ${foundVariant.name}`,
                    price: foundVariant.price,
                    cost: foundVariant.cost,
                    sku: foundVariant.sku,
                    barcode: foundVariant.barcode,
                    currency: foundItem.currency, // Inherit from parent
                    category: foundItem.category, // Inherit from parent
                };
                addItemToCart(itemToAdd);
                showToast(`Added: ${itemToAdd.name}`, 'success');
            } else {
                // It's a simple product
                addItemToCart(foundItem);
                showToast(`Added: ${foundItem.name}`, 'success');
            }
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
                    qrbox: 
                    
                    qrboxFunction,
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
        chargeItems = chargeItems.filter(i => (i.variantId || i.id) !== itemId);
        if (chargeItems.length === 0) {
            clearCharge();
        }
    }

    function incrementQuantity(itemId) {
        const itemIndex = chargeItems.findIndex(i => (i.variantId || i.id) === itemId);
        if (itemIndex > -1) {
            chargeItems[itemIndex].quantity += 1;
            chargeItems = chargeItems;
        }
    }

    function decrementQuantity(itemId) {
        const itemIndex = chargeItems.findIndex(i => (i.variantId || i.id) === itemId);
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
        applyTax = $defaultTaxable;
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
        let subtotal = 0;
        if (chargeItems.length > 0) {
            subtotal = chargeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const firstItem = chargeItems[0];
            if (firstItem && $selectedMint !== firstItem.currency) {
                $selectedMint = firstItem.currency;
            }
        } else {
            const fullAmount = `${left || '0'}${right ? '.' + right : ''}`;
            subtotal = parseFloat(fullAmount) || 0;
        }
        
        const taxAmount = applyTax ? subtotal * ($taxRate / 100) : 0;
        const total = subtotal + taxAmount;

        $pmtAmt = total.toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4 
        });
    }

    function createQRCode() {
        let subtotal = 0;
        if(chargeItems.length > 0) {
            subtotal = chargeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        } else {
            subtotal = parseFloat($pmtAmt.replace(/,/g, '')) / (applyTax ? (1 + ($taxRate / 100)) : 1);
        }
        
        const taxAmount = applyTax ? subtotal * ($taxRate / 100) : 0;
        const total = subtotal + taxAmount;
        
        if (total > 0) {
            const itemsForTx = chargeItems.map(item => ({
                id: item.id, variantId: item.variantId, name: item.name,
                price: item.price, cost: item.cost, quantity: item.quantity,
                sku: item.sku
            }));
            $currentChargeItems = itemsForTx;

            chargeMetadata.set({ subtotal, taxAmount, taxRate: $taxRate, applyTax });

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

<div id="pos-card" class="card w-full max-w-5xl h-full bg-base-100 shadow-xl border flex-grow">
    <div class="card-body p-4 sm:p-6 flex flex-col md:flex-row gap-4 h-full">
        
        <div class="flex flex-col md:w-1/2 h-full">
            <h2 class="card-title text-xl font-greycliffmed mb-2">Current Charge</h2>
            
            <div class="flex-grow overflow-y-auto pr-2 -mr-2">
                {#if chargeItems.length > 0}
                    <div class="space-y-2 text-left">
                        {#each chargeItems as item (item.variantId || item.id)}
                            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-2">
                                <span class="flex-grow truncate font-greycliffmed">{item.name}</span>
                                <div class="flex items-center justify-end gap-2">
                                    <div class="flex items-center justify-center space-x-2">
                                        <button on:click={() => decrementQuantity(item.variantId || item.id)} class="btn btn-xs btn-ghost">-</button>
                                        <span>{item.quantity}</span>
                                        <button on:click={() => incrementQuantity(item.variantId || item.id)} class="btn btn-xs btn-ghost">+</button>
                                    </div>
                                    <span class="w-20 text-right font-mono">{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="h-full flex items-center justify-center text-center text-base-content/50">
                        <p>Add items from inventory or use the keypad to enter a custom amount.</p>
                    </div>
                {/if}
            </div>

            <div class="mt-auto pt-2 space-y-2">
                 <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Apply Tax ({$taxRate}%)</span> 
                        <input type="checkbox" class="toggle toggle-primary" bind:checked={applyTax} />
                    </label>
                </div>
                <div class="flex space-x-2">
                    <button on:click={() => showInventoryModal = true} class="btn btn-secondary normal-case flex-1">Add Item</button>
                    {#if chargeItems.length > 0}
                        <button on:click={clearCharge} class="btn btn-warning normal-case">Clear</button>
                    {/if}
                </div>
                <button on:click={createQRCode} class="btn btn-primary text-white font-greycliffbold normal-case w-full">Create QR Code</button>
            </div>
        </div>

        <div id="pos-input-section" class="flex flex-col md:w-1/2 h-full">
            <div class="flex items-center justify-center space-x-2 p-2 bg-base-200 rounded-lg mb-2">
                {#if $selectedMint === "USDC"}
                    <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000">
                        <path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" fill="#2775ca"/>
                        <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
                    </svg>
                {:else if $selectedMint === "SOL"}
                   <img src="{solLogo}" class="w-9" alt="SOL" />
                {:else if $selectedMint === "BONK"}
                    <img src="{bonkLogo}" class="w-9 rounded-full" alt="BONK" />
                {:else if $selectedMint === "HNT"}
                    <img src="{hntLogo}" class="w-9" alt="HNT" />
                {/if}
                <input bind:value={$pmtAmt} class="input input-ghost w-full text-right text-2xl md:text-3xl font-mono" placeholder="0.00" readonly />
            </div>
            
            <div class="space-y-2 mb-2">
                <form on:submit|preventDefault={handleBarcodeSubmit} class="input-group">
                    <input type="text" placeholder="Scan Barcode..." class="input input-bordered w-full input-sm" bind:value={barcodeInput} />
                    <button type="submit" class="btn btn-square btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </form>

                {#if !isScannerVisible}
                    <button on:click={startScanner} class="btn btn-outline btn-xs w-full">
                        Camera Scan
                    </button>
                {/if}
                
                <div class:hidden={!isScannerVisible}>
                    <div id="reader" class="w-full border-2 border-dashed rounded-lg overflow-hidden"></div>
                    <button on:click={stopScanner} class="btn btn-error btn-xs mt-1 w-full">End Scan</button>
                </div>
            </div>

            <div class="flex-grow" class:hidden={chargeItems.length > 0}>
                <Keyboard custom="{keys}" on:keydown="{onKeydown}" />
            </div>

        </div>
    </div>
</div>
