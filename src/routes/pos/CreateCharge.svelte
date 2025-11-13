<script lang='ts'>
    import { onMount, onDestroy, tick } from "svelte";
    import { goto } from '$app/navigation';
import { pmtAmt, selectedMint, currentChargeItems, inventory, taxRate, defaultTaxable, chargeMetadata, successArray, mints, chargeCardFee as defaultChargeCardFee, customers, selectedCustomer, savedCarts, loyaltyRedemptionRate, barcodeScanned, cartDiscount } from '../stores.js';
import { tokenPrices } from '../priceStore.js';
    import { showToast } from '../toastStore.js';
    import Keyboard from "svelte-keyboard";
import { browser } from '$app/environment';
    import { Html5QrcodeScanner } from 'html5-qrcode';
    import bonkLogo from "../../lib/images/BonkLogo.png";
    import solLogo from "../../lib/images/solanaLogoMark.png";
import InventoryModal from "./InventoryModal.svelte";
    import CustomerSelectModal from "./CustomerSelectModal.svelte";
    import CustomerDetailsModal from '../crm/CustomerDetailsModal.svelte';
    import { stripePublishableKey, stripeSecretKey } from '../stores.js';
import CardPaymentModal from './CardPaymentModal.svelte';
    import CashAppModal from './CashAppModal.svelte'; // NEW IMPORT
    import LoadCartModal from './LoadCartModal.svelte';
import { logHistory } from '../../utils/inventory.js';
    import { get } from 'svelte/store';
    import dayjs from 'dayjs';
import { page } from '$app/stores';
    import DiscountModal from './DiscountModal.svelte';

    let showCustomerModal = false;
    let showNewCustomerModal = false;
let showInventoryModal = false;
    let showLoadCartModal = false;
    let showDiscountModal = false;
    let chargeItems = [];
    let barcodeInput = '';
let applyTax = $defaultTaxable;
    let applyCardFee = $defaultChargeCardFee;

    let showCardModal = false;
    let paymentClientSecret = null;
    let chargeForCardPayment = {};
// --- NEW CASH APP STATE ---
    let showCashAppModal = false;
    let cashAppClientSecret = null;
let chargeForCashAppPayment = {};
    // --- END NEW CASH APP STATE ---

    // --- Loyalty State ---
    let redemptionDiscount = 0;
let isRedeeming = false;
    let appliedDiscountValue = 0;
    let appliedPointsRedeemed = 0;
    let appliedOrderDiscountValue = 0;
// --- Scanner State ---
    let scanner = null;
    let isScannerVisible = false;
    let lastScanTime = 0;
let lastScanResult = '';
    const SCAN_COOLDOWN = 3000;


	// --- NEW: Handle globally scanned barcode ---
    barcodeScanned.subscribe(barcode => {
		// Only process if we are on the POS page
        if (barcode && $page.url.pathname.includes('/pos')) {
            addItemByBarcode(barcode);
            barcodeScanned.set(null); // Reset the store after processing
        }
    });
// --- END ---


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
        const uniqueId = itemToAdd.variantId ||
itemToAdd.id;
        const existingItemIndex = chargeItems.findIndex(i => (i.variantId || i.id) === uniqueId);
if (existingItemIndex > -1) {
            chargeItems[existingItemIndex].quantity += 1;
} else {
            // MODIFIED: Added priceAdjustmentPercent
            chargeItems.push({ ...itemToAdd, quantity: 1, priceAdjustmentPercent: 0 });
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
                    foundItem = item;
// We found the parent item
                    break;
// Exit loop once found
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
$selectedCustomer = null;
        isRedeeming = false; // Reset new redemption state
        $cartDiscount = null;
}

    // --- Save and Load Cart Logic ---
    function saveCart() {
        if (chargeItems.length === 0 && !parseFloat($pmtAmt.replace(/,/g, ''))) {
            showToast("Cannot save an empty cart.", "info");
return;
        }

        const cartName = prompt("Enter a name for this cart (optional):", `Cart - ${dayjs().format('MM/DD HH:mm')}`);
if (cartName === null) return; // User cancelled

        // Handle custom amount: create a pseudo-item
        let itemsToSave = [];
if (chargeItems.length === 0 && parseFloat($pmtAmt.replace(/,/g, ''))) {
            const customAmount = parseFloat($pmtAmt.replace(/,/g, ''));
// Create a temporary item representing the custom amount
            itemsToSave.push({
                id: `custom-${Date.now()}`,
                name: `Custom Amount (${$selectedMint})`,
                price: customAmount, // Store the final amount directly
                // Add other properties if 

                // needed, e.g., taxable status
                taxable: applyTax, // Store whether tax was applied to this amount
            });
} else {
            itemsToSave = JSON.parse(JSON.stringify(chargeItems));
// Deep copy
        }


        const newSavedCart = {
            id: Date.now().toString(),
            name: cartName ||
`Cart - ${dayjs().format('MM/DD HH:mm')}`,
            items: itemsToSave,
            customerId: $selectedCustomer ?
$selectedCustomer.id : null,
            // Store tax setting applied at save time
            applyTax: applyTax,
        };
savedCarts.update(carts => [...carts, newSavedCart]);
        showToast(`Cart "${newSavedCart.name}" saved!`, 'success');
        clearCharge(); // Optionally clear after saving
    }

    function handleLoadCart(event) {
        const loadedCart = event.detail;
if (loadedCart) {
            chargeItems = JSON.parse(JSON.stringify(loadedCart.items));
// Deep copy
            applyTax = loadedCart.applyTax ?? $defaultTaxable;
// Load saved tax setting or use default

            // Check if the loaded cart was a custom amount
            if (chargeItems.length === 1 && chargeItems[0].id.startsWith('custom-')) {
                const customItem = chargeItems[0];
$pmtAmt = customItem.price.toLocaleString("en", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4
                });
// Set the currency from the custom item
                $selectedMint = customItem.currency;
// Set the keypad state (approximation)
                const parts = customItem.price.toFixed(4).split('.');
left = parts[0] === '0' ? '' : parts[0];
                right = parts[1] ? parts[1].replace(/0+$/, '') : '';
// Remove trailing zeros
                decimalsActive = !!right;
// Clear chargeItems as it was just a custom amount placeholder
                chargeItems = [];
} else {
                 // For regular carts with items, ensure numpad is cleared
                 left = "";
right = "";
                 decimalsActive = false;
                 // Set currency from first item
                 if(chargeItems.length > 0) {
                    $selectedMint = chargeItems[0].currency;
}
            }


            // Load customer
            if (loadedCart.customerId) {
                const customer = $customers.find(c => c.id === loadedCart.customerId);
$selectedCustomer = customer || null;
            } else {
                $selectedCustomer = null;
}

            // Reset redemption state when loading a cart
            isRedeeming = false;
$cartDiscount = null; // MODIFIED: Reset cart discount
        }
        showLoadCartModal = false;
}


    onMount(() => {
        // Clear charge on mount if needed, ensure $currentChargeItems is also cleared
        clearCharge();
    });
onDestroy(() => {
        stopScanner(); // Ensure camera is released when leaving the page
    });
// --- Reactive loyalty and total calculation ---
    $: redemptionRate = $loyaltyRedemptionRate;
// Calculate max available USD discount
    $: {
        if ($selectedCustomer && $selectedCustomer.loyaltyPoints > 0) {
            const { points, discount } = redemptionRate;
redemptionDiscount = Math.floor($selectedCustomer.loyaltyPoints / points) * discount;
        } else {
            redemptionDiscount = 0;
isRedeeming = false;
        }
    }
    
    // NEW REACTIVE VARIABLES FOR DISCOUNT TRACKING
    $: appliedDiscountValue = 0;
$: appliedPointsRedeemed = 0; 
    $: appliedOrderDiscountValue = 0; // MODIFIED: Added for new cart discount

    $: {
        let subtotal = 0;
// MODIFIED: Calculate subtotal using per-item adjustments
        if (chargeItems.length > 0) {
            subtotal = chargeItems.reduce((acc, item) => {
                const adjustmentPercent = item.priceAdjustmentPercent || 0;
                const adjustedPrice = item.price * (1 + adjustmentPercent / 100);
                return acc + 

                
                (adjustedPrice * item.quantity);
            }, 0);
const firstItem = chargeItems[0];
            if (firstItem && $selectedMint !== firstItem.currency) {
                $selectedMint = firstItem.currency;
}
        } else {
             // Only use numpad value if there are no items
            const fullAmount = `${left ||
'0'}${right ? '.' + right : ''}`;
            subtotal = parseFloat(fullAmount) || 0;
}
        // END MODIFIED SUBTOTAL CALCULATION

        // --- MODIFIED: Apply Order Discount (before tax) ---
        let preTaxSubtotal = subtotal;
let orderDiscountAmount = 0;
        if ($cartDiscount) {
            if ($cartDiscount.type === 'percentage') {
                orderDiscountAmount = preTaxSubtotal * ($cartDiscount.value / 100);
} else { // 'fixed'
                orderDiscountAmount = $cartDiscount.value;
}
            // Ensure discount doesn't exceed subtotal
            orderDiscountAmount = Math.min(preTaxSubtotal, orderDiscountAmount);
preTaxSubtotal -= orderDiscountAmount;
        }
        appliedOrderDiscountValue = orderDiscountAmount;
// Store the calculated crypto/USD value
        // --- END Order Discount ---

        const taxAmount = applyTax ?
preTaxSubtotal * ($taxRate / 100) : 0; // Tax is calculated on the discounted subtotal
        let total = preTaxSubtotal + taxAmount;
// --- LOYALTY REDEMPTION APPLIED HERE (after tax, on the remaining total) ---
        if (isRedeeming && redemptionDiscount > 0) {
            const prices = get(tokenPrices);
const mintInfo = get(mints).find(m => m.name === $selectedMint);
            let cryptoPrice = 1;
// Default for USDC/USD
            if ($selectedMint !== 'USDC' && $selectedMint !== 'USD' && mintInfo && prices[mintInfo.coingeckoId]?.usd) {
                cryptoPrice = prices[mintInfo.coingeckoId].usd;
}
            
            // Calculate crypto discount amount
            const cryptoDiscount = redemptionDiscount / cryptoPrice;
// The discount cannot exceed the total amount due (total)
            // Store this for passing to metadata
            appliedDiscountValue = Math.min(cryptoDiscount, total);
const pointsPerDiscount = (redemptionRate.discount / redemptionRate.points);
            appliedPointsRedeemed = Math.ceil(appliedDiscountValue / pointsPerDiscount) * redemptionRate.points;
            appliedPointsRedeemed = Math.min(appliedPointsRedeemed, $selectedCustomer?.loyaltyPoints || 0);
// Cap points used at actual balance
            
            // Recalculate appliedDiscountValue based on the capped appliedPointsRedeemed
            appliedDiscountValue = (appliedPointsRedeemed / redemptionRate.points) * redemptionRate.discount;
total -= appliedDiscountValue;
        } else {
             appliedDiscountValue = 0;
appliedPointsRedeemed = 0;
        }
        // --- END LOYALTY REDEMPTION ---


        $pmtAmt = total.toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
}

    function createQRCode() {
        let subtotal = 0;
let itemsForTx = [];
        const finalPmtAmt = parseFloat($pmtAmt.replace(/,/g, ''));
        
        if (finalPmtAmt <= 0) {
             if(browser) showToast("Amount must be greater than zero.", "error");
return;
        }

        if(chargeItems.length > 0) {
            // MODIFIED: Calculate subtotal using adjusted price
            subtotal = chargeItems.reduce((acc, item) => {
                const adjustmentPercent = item.priceAdjustmentPercent || 0;
                const adjustedPrice = item.price * (1 + adjustmentPercent / 100);
       

                return acc + (adjustedPrice * item.quantity);
            }, 0);
// MODIFIED: Map items to include adjustment details
            itemsForTx = chargeItems.map(item => ({
                id: item.id, variantId: item.variantId, name: item.name,
                price: item.price, // original price
                adjustedPrice: item.price * (1 + (item.priceAdjustmentPercent || 0) / 100),
           

                priceAdjustmentPercent: item.priceAdjustmentPercent || 0,
                cost: item.cost, quantity: item.quantity,
                sku: item.sku
            }));
} else {
            // Handle custom amount for QR code payment
            if (finalPmtAmt > 0) {
                subtotal = finalPmtAmt / (applyTax ? (1 + ($taxRate / 100)) : 1);
// Create a representative item for the receipt/metadata
                itemsForTx.push({
                    id: `custom-${Date.now()}`,
                    name: `Custom Amount (${$selectedMint})`,
                    price: finalPmtAmt, // Use the final total for the single item price
  

                    quantity: 1,
                    currency: $selectedMint,
                    taxable: applyTax, // Include taxable status
                });
} else {
                subtotal = 0;
}
        }
        
        // MODIFIED: Calculate discounts based on the *original* subtotal
        let orderDiscountAmount = 0;
if ($cartDiscount) {
            if ($cartDiscount.type === 'percentage') {
                orderDiscountAmount = subtotal * ($cartDiscount.value / 100);
} else { // 'fixed'
                orderDiscountAmount = $cartDiscount.value;
}
            orderDiscountAmount = Math.min(subtotal, orderDiscountAmount);
}
        const subtotalAfterOrderDiscount = subtotal - orderDiscountAmount;
        const taxAmount = applyTax ?
subtotalAfterOrderDiscount * ($taxRate / 100) : 0;
        
        let loyaltyDiscountAmount = 0;
        let pointsRedeemed = 0;
if (isRedeeming) {
            loyaltyDiscountAmount = appliedDiscountValue;
            pointsRedeemed = appliedPointsRedeemed;
}


        if (finalPmtAmt > 0) { // Check finalPmtAmt which already includes all discounts
            // Use itemsForTx which handles both item lists and custom amounts
            $currentChargeItems = itemsForTx;
$pmtAmt = finalPmtAmt.toString(); // Ensure store reflects final amount
            chargeMetadata.set({ 
                subtotal, // Original subtotal
                taxAmount, 
                taxRate: $taxRate, 
                applyTax,
         

                // Pass new loyalty data
                isRedeeming: isRedeeming, 
                loyaltyDiscountAmount: loyaltyDiscountAmount,
                pointsRedeemed: pointsRedeemed,
                // Order Discount Data
                orderDiscountAmount: orderDiscountAmount,
                orderDiscountCode: $cartDiscount ? $cartDiscount.code : null
            });
goto('/present');
        } else {
            if(browser) showToast("Please enter an amount greater than zero.", "error");
}
	}

    async function payWithCard() {
        if (!$stripePublishableKey || !$stripeSecretKey) {
            showToast("Stripe is not configured. Please add your API keys in the settings.", "error");
return;
        }

        const totalInCrypto = parseFloat($pmtAmt.replace(/,/g, ''));
if (totalInCrypto <= 0) {
            showToast("Please enter an amount greater than zero.", "error");
return;
        }

        let totalInUSD = totalInCrypto;
        const prices = get(tokenPrices);
const mintInfo = get(mints).find(m => m.name === $selectedMint);
        let currentPrice = 1;
if ($selectedMint !== 'USDC' && $selectedMint !== 'USD') {
             if (!mintInfo || !prices[mintInfo.coingeckoId]?.usd) {
                showToast(`Could not get live price for ${$selectedMint}. Please try again in a moment.`, 'error');
return;
            }
            currentPrice = prices[mintInfo.coingeckoId].usd;
totalInUSD = totalInCrypto * currentPrice;
        }

        // --- Start Card-specific calculation block ---
        let subtotal = 0;
let itemsForTx = [];
        if(chargeItems.length > 0) {
            subtotal = chargeItems.reduce((acc, item) => {
                const adjustmentPercent = item.priceAdjustmentPercent || 0;
                const adjustedPrice = item.price * (1 + adjustmentPercent / 100);
            
            
      
          return acc + (adjustedPrice * item.quantity);
            }, 0);
itemsForTx = chargeItems.map(item => ({
                ...item,
                price: item.price,
                adjustedPrice: item.price * (1 + (item.priceAdjustmentPercent || 0) / 100),
                priceAdjustmentPercent: item.priceAdjustmentPercent || 
            0,
       
     }));
        } else {
            subtotal = totalInCrypto / (applyTax ? (1 + ($taxRate / 100)) : 1);
itemsForTx.push({
                id: `custom-${Date.now()}`,
                name: `Custom Amount (${$selectedMint})`,
                price: totalInCrypto, // Store original crypto amount
                quantity: 1,
                currency: $selectedMint,
        

                taxable: applyTax,
            });
}
        
        let orderDiscountAmountUSD = 0;
if ($cartDiscount) {
            if ($cartDiscount.type === 'percentage') {
                orderDiscountAmountUSD = (subtotal * currentPrice) * ($cartDiscount.value / 100);
} else { // 'fixed'
                orderDiscountAmountUSD = $cartDiscount.value;
}
            orderDiscountAmountUSD = Math.min((subtotal * currentPrice), orderDiscountAmountUSD);
}

        const subtotalAfterOrderDiscountUSD = (subtotal * currentPrice) - orderDiscountAmountUSD;
const taxAmountUSD = applyTax ? subtotalAfterOrderDiscountUSD * ($taxRate / 100) : 0;
        
        let totalAfterOrderDiscountAndTax = subtotalAfterOrderDiscountUSD + taxAmountUSD;
let loyaltyDiscountAmountUSD = 0;
        let pointsRedeemed = 0;
        if (isRedeeming) {
            loyaltyDiscountAmountUSD = appliedDiscountValue * currentPrice;
loyaltyDiscountAmountUSD = Math.min(totalAfterOrderDiscountAndTax, loyaltyDiscountAmountUSD);
            pointsRedeemed = appliedPointsRedeemed;
        }

        // This is the final pre-fee total
        let finalTotalUSD = totalAfterOrderDiscountAndTax - loyaltyDiscountAmountUSD;
if (applyCardFee) {
            finalTotalUSD *= 1.03;
// Apply 3% Fee
        }

        chargeForCardPayment = {
            total: finalTotalUSD, // Final USD amount charged (after discounts and fee)
            subtotal: subtotal * currentPrice, // Original subtotal in USD
            taxAmount: taxAmountUSD, // Tax amount in USD (post-order-discount)
            taxable: applyTax,
     
       taxRate: $taxRate,
   
            originalAmount: totalInCrypto, 
            originalMint: $selectedMint,
            items: itemsForTx, // Use itemsForTx
            // Loyalty Data
            loyaltyDiscountAmount: loyaltyDiscountAmountUSD, // USD value of discount applied
            pointsRedeemed: 
pointsRedeemed,
            // Order Discount Data
            orderDiscountAmount: orderDiscountAmountUSD,
            orderDiscountCode: $cartDiscount ?
$cartDiscount.code : null
        };
// --- End Card-specific calculation block ---
        
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalTotalUSD, // MODIFIED: Pass the final calculated USD total
                    stripeSecretKey: $stripeSecretKey,
                    currency: 'usd',
               
     paymentMethodType: 'card' // CRITICAL: Explicitly set payment method type
                })
            });
const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
}

            paymentClientSecret = data.clientSecret;
            showCardModal = true;
} catch (error) {
            console.error("Failed to create Payment Intent:", error);
showToast("Could not initiate card payment. Please check the console.", "error");
}
    }

    // --- NEW FUNCTION: Pay with Cash App ---
    async function payWithCashApp() {
        if (!$stripePublishableKey || !$stripeSecretKey) {
            showToast("Stripe is not configured. Please add your API keys in the settings.", "error");
return;
        }

        const totalInCrypto = parseFloat($pmtAmt.replace(/,/g, ''));
if (totalInCrypto <= 0) {
            showToast("Please enter an amount greater than zero.", "error");
return;
        }
        
        let totalInUSD = totalInCrypto;
const prices = get(tokenPrices);
        const mintInfo = get(mints).find(m => m.name === $selectedMint);
        let currentPrice = 1;
if ($selectedMint !== 'USDC' && $selectedMint !== 'USD') {
             if (!mintInfo || !prices[mintInfo.coingeckoId]?.usd) {
                showToast(`Could not get live price for ${$selectedMint}. Please try again in a moment.`, 'error');
return;
            }
            currentPrice = prices[mintInfo.coingeckoId].usd;
totalInUSD = totalInCrypto * currentPrice;
        }

        // --- Start Cash App-specific calculation block (NO 3% FEE) ---
        let subtotal = 0;
let itemsForTx = [];
        if(chargeItems.length > 0) {
            subtotal = chargeItems.reduce((acc, item) => {
                const adjustmentPercent = item.priceAdjustmentPercent || 0;
                const adjustedPrice = item.price * (1 + adjustmentPercent / 100);
                return acc + (adjustedPrice * item.quantity);
         
   }, 0);
            itemsForTx = chargeItems.map(item => ({
                ...item,
                price: item.price,
                adjustedPrice: item.price * (1 + (item.priceAdjustmentPercent || 0) / 100),
                priceAdjustmentPercent: item.priceAdjustmentPercent || 0,
            }));
} else {
            subtotal = totalInCrypto / (applyTax ? (1 + ($taxRate / 100)) : 1);
itemsForTx.push({
                id: `custom-${Date.now()}`,
                name: `Custom Amount (${$selectedMint})`,
                price: totalInCrypto,
                quantity: 1,
                currency: $selectedMint,
             
   taxable: applyTax,
            });
}
        
        let orderDiscountAmountUSD = 0;
if ($cartDiscount) {
            if ($cartDiscount.type === 'percentage') {
                orderDiscountAmountUSD = (subtotal * currentPrice) * ($cartDiscount.value / 100);
} else { 
                orderDiscountAmountUSD = $cartDiscount.value;
}
            orderDiscountAmountUSD = Math.min((subtotal * currentPrice), orderDiscountAmountUSD);
}

        const subtotalAfterOrderDiscountUSD = (subtotal * currentPrice) - orderDiscountAmountUSD;
const taxAmountUSD = applyTax ? subtotalAfterOrderDiscountUSD * ($taxRate / 100) : 0;
        
        let totalAfterOrderDiscountAndTax = subtotalAfterOrderDiscountUSD + taxAmountUSD;
let loyaltyDiscountAmountUSD = 0;
        let pointsRedeemed = 0;
        if (isRedeeming) {
            loyaltyDiscountAmountUSD = appliedDiscountValue * currentPrice;
loyaltyDiscountAmountUSD = Math.min(totalAfterOrderDiscountAndTax, loyaltyDiscountAmountUSD);
            pointsRedeemed = appliedPointsRedeemed;
        }

        // NO 3% FEE APPLIED
        let finalTotalUSD = totalAfterOrderDiscountAndTax - loyaltyDiscountAmountUSD;
chargeForCashAppPayment = {
            total: finalTotalUSD, // Final USD amount charged
            subtotal: subtotal * currentPrice, 
            taxAmount: taxAmountUSD, 
            taxable: applyTax,
            taxRate: $taxRate,
            originalAmount: totalInCrypto, 
          
  originalMint: $selectedMint,
            items: itemsForTx,
            loyaltyDiscountAmount: loyaltyDiscountAmountUSD,
            pointsRedeemed: pointsRedeemed,
            // Order Discount Data
            orderDiscountAmount: orderDiscountAmountUSD,
            orderDiscountCode: $cartDiscount ?
$cartDiscount.code : null
        };
// --- End Cash App-specific calculation block ---

        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
             
       amount: finalTotalUSD,
                    stripeSecretKey: $stripeSecretKey,
                    currency: 'usd',
                    paymentMethodType: 'cashapp' // NEW: Explicitly send 'cashapp'
                })
        
    });
            const data = await response.json();
if (data.error) {
                throw new Error(data.error);
}

            cashAppClientSecret = data.clientSecret;
            showCashAppModal = true;
} catch (error) {
            console.error("Failed to create Payment Intent for Cash App:", error);
showToast("Could not initiate Cash App payment. Check Stripe keys and console.", "error");
}
    }
    
    // --- MODIFIED SUCCESS HANDLER: for Cash App Payments ---
    function handleCashAppPaymentSuccess(paymentIntentId) {
        
        const chargeData = chargeForCashAppPayment;
const new_entry = {
            txnId: Date.now().toString(),
            timestamp: Math.floor(Date.now() / 1000),
            txid: paymentIntentId,
            uiAmount: chargeData.total, // Final USD amount
            mint: 'USD', // Record as USD transaction
            originalAmount: chargeData.originalAmount, 
       
     originalMint: chargeData.originalMint,
            items: chargeData.items,
            subtotal: chargeData.subtotal, 
            taxAmount: chargeData.taxAmount, 
            taxRate: chargeData.taxRate,
            taxable: chargeData.taxable,
            customerId: $selectedCustomer ?
$selectedCustomer.id : null,
            loyaltyDiscountAmount: chargeData.loyaltyDiscountAmount,
            pointsRedeemed: chargeData.pointsRedeemed,
            orderDiscountAmount: chargeData.orderDiscountAmount,
            orderDiscountCode: chargeData.orderDiscountCode,
            paymentType: 'Cash App' // CRITICAL: Identify payment method
        };
successArray.update(items => [...items, new_entry]);
        
        // --- Loyalty and Inventory logic (Copied from existing implementation) ---
        if ($selectedCustomer) {
            let pointsChange = 0;
if (new_entry.loyaltyDiscountAmount > 0 && new_entry.pointsRedeemed > 0) {
                pointsChange -= new_entry.pointsRedeemed;
showToast(`Redeemed ${new_entry.pointsRedeemed} points for $${new_entry.loyaltyDiscountAmount.toFixed(2)} discount!`, 'info');
            }
            let usdValueForAward = new_entry.subtotal - new_entry.orderDiscountAmount + new_entry.taxAmount - new_entry.loyaltyDiscountAmount;
const pointsAwarded = Math.floor(Math.max(0, usdValueForAward));
            pointsChange += pointsAwarded;
            if (pointsAwarded > 0) {
                 showToast(`Awarded ${pointsAwarded} loyalty points!`, 'success');
}
            if (pointsChange !== 0) {
                customers.update(allCustomers => allCustomers.map(cust => cust.id === $selectedCustomer.id ? { ...cust, loyaltyPoints: Math.max(0, (cust.loyaltyPoints || 0) + pointsChange) } : cust));
selectedCustomer.update(cust => ({...cust, loyaltyPoints: Math.max(0, (cust.loyaltyPoints || 0) + pointsChange) }));
}
        }
        if (chargeData.items && chargeData.items.length > 0 && !chargeData.items[0].id.startsWith('custom-')) {
            inventory.update(inv => {
                const newInv = [...inv];
            for (const soldItem of chargeData.items) {
                    const itemIndex = newInv.findIndex(i => i.id 
=== soldItem.id);
                    if (itemIndex > -1) {
                        if (newInv[itemIndex].type === 'simple') {
                             const newQty = newInv[itemIndex].quantity - soldItem.quantity;
             
               newInv[itemIndex].quantity = newQty;
                            logHistory(soldItem.id, `Sale (Cash App: ${paymentIntentId.slice(-6)})`, `-${soldItem.quantity}`, newQty);
                        } else if (newInv[itemIndex].type === 'variable' && soldItem.variantId) {
                 
           const variantIndex = newInv[itemIndex].variants.findIndex(v => v.id === soldItem.variantId);
                            if (variantIndex > -1) {
                                const newVariantQty = newInv[itemIndex].variants[variantIndex].quantity - soldItem.quantity;
newInv[itemIndex].variants[variantIndex].quantity = newVariantQty;
                                newInv[itemIndex].quantity = newInv[itemIndex].variants.reduce((total, v) => total + v.quantity, 0);
                                logHistory(newInv[itemIndex].variants[variantIndex].id, `Sale (Cash App: ${paymentIntentId.slice(-6)})`, `-${soldItem.quantity}`, newVariantQty);
}
                        }
                    }
                }
                return newInv;
});
        }
        // --- End Loyalty and Inventory logic ---
        
        showToast("Cash App payment successful!", "success");
clearCharge();
    }
    // --- END MODIFIED SUCCESS HANDLER ---


    const onKeydown = (event) => {
        // Disable keypad if items are in the cart
        if (chargeItems.length > 0) return;
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
    
    function calculateLineTotal(item) {
        const adjustmentPercent = item.priceAdjustmentPercent ||
0;
        const adjustedPrice = item.price * (1 + adjustmentPercent / 100);
        return adjustedPrice * item.quantity;
}
</script>

{#if showCardModal}
    <CardPaymentModal
        clientSecret={paymentClientSecret}
        publishableKey={$stripePublishableKey}
        on:close={() => showCardModal = false}
        on:success={(e) => {
            showCardModal = false;
handleCardPaymentSuccess(e.detail.paymentIntentId);
        }}
    />
{/if}

{#if showCashAppModal}
    <CashAppModal
        clientSecret={cashAppClientSecret}
        publishableKey={$stripePublishableKey}
        returnUrl={`${window.location.origin}/pos`}
        totalAmount={chargeForCashAppPayment.total}
        on:close={() => showCashAppModal = false}
        on:success={(e) => {
            showCashAppModal = false;
handleCashAppPaymentSuccess(e.detail.paymentIntentId);
        }}
    />
{/if}

{#if showInventoryModal}
    <InventoryModal
        currentCurrency={chargeItems.length > 0 ?
$selectedMint : null}
        on:addItem={handleAddItemFromModal}
        on:close={() => showInventoryModal = false}
    />
{/if}

{#if showCustomerModal}
    <CustomerSelectModal
        on:select={(e) => { $selectedCustomer = e.detail;
showCustomerModal = false; }}
        on:close={() => showCustomerModal = false}
        on:new={() => { showCustomerModal = false;
showNewCustomerModal = true; }}
    />
{/if}

{#if showNewCustomerModal}
    <CustomerDetailsModal
        on:close={() => showNewCustomerModal = false}
        on:save={(e) => { $selectedCustomer = e.detail;
showNewCustomerModal = false; }}
    />
{/if}

{#if showLoadCartModal}
    <LoadCartModal
        on:select={handleLoadCart}
        on:close={() => showLoadCartModal = false}
    />
{/if}

{#if showDiscountModal}
    <DiscountModal on:close={() => showDiscountModal = false} />
{/if}


<div id="pos-card" class="card w-full max-w-5xl h-full bg-base-100 shadow-xl border flex-grow">
    <div class="card-body p-4 sm:p-6 flex flex-col md:flex-row gap-4 h-full">

        <div class="flex flex-col md:w-1/2 h-full">
            <h2 class="card-title text-xl font-greycliffmed mb-2">Current Charge</h2>

   

             <div class="flex-grow 
 
    overflow-y-auto pr-2 -mr-2 mb-2">

                {#if $selectedCustomer}
                    <div class="alert alert-info shadow-lg mb-2 py-1 px-3 text-sm">
                        <div class="flex justify-between items-center w-full">
     
    
                    <span>Cust: {$selectedCustomer.name} (Pts: {$selectedCustomer.loyaltyPoints || 0})</span>
                           <button class="btn btn-xs btn-ghost" on:click={() => $selectedCustomer = null}>✕</button>
                        </div>
            
     
    </div>
                {/if}

                {#if $cartDiscount}
                    <div class="alert alert-success shadow-lg mb-2 py-1 px-3 text-sm">
                        <div class="flex justify-between items-center w-full">
   
      
                    <span>Discount: {$cartDiscount.code} (-{$cartDiscount.type === 'percentage' ?
`${$cartDiscount.value}%` : `$${$cartDiscount.value.toFixed(2)}`})</span>
                           <button class="btn btn-xs btn-ghost" on:click={() => $cartDiscount = null}>✕</button>
                        </div>
                    </div>
                {/if}
   

              
                {#if redemptionDiscount > 0 && !$cartDiscount} <div class="form-control mb-2">
                        <label class="label cursor-pointer py-1 bg-success/20 rounded-lg">
                            <span class="label-text font-bold text-success">
  
 
                              Redeem {$loyaltyRedemptionRate.points} Pts = ${$loyaltyRedemptionRate.discount.toFixed(2)} Off (Max: ${redemptionDiscount.toFixed(2)})
                            </span>
                            <input type="checkbox" class="toggle toggle-success toggle-sm" bind:checked={isRedeeming} 
/>
  
                        </label>
                    </div>
                {:else if redemptionDiscount > 0 && $cartDiscount}
                    <div class="alert alert-warning shadow-lg mb-2 py-1 px-3 text-xs">
     
    
                Loyalty redemption is disabled when an order discount is applied.
</div>
                {/if}
                {#if chargeItems.length > 0}
                    <div class="space-y-2 text-left">
                        
                   

                        <div class="hidden sm:flex justify-end 
                        text-xs font-bold text-base-content/70 pb-1 border-b border-base-200">
                             <span class="w-16 mr-2">Adj %</span>
           
                  <span 
class="w-16 mr-2">Qty</span>
                             <span class="w-20 text-right">Total</span>
                        </div>
                        
 
                   
                        {#each chargeItems as item (item.variantId ||
                        item.id)}
                            
<div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-2">
                               
                            <span class="flex-grow truncate font-greycliffmed">{item.name}</span>
                             
 
                               <div class="flex items-center justify-end gap-2">
                               
                                  
  <div class="w-16 flex items-center">
                                         <input type="number" 
             
                                       
  
                                             bind:value={item.priceAdjustmentPercent} 
                     
                               
              min="-99.9" max="999.9" step="0.1"
                                               class="input input-bordered 
                       
            
                                 input-xs w-full text-center font-mono" />
                                    </div>
                           
         <div class="flex items-center 
justify-center space-x-2">
                                        <button on:click={() => decrementQuantity(item.variantId ||
item.id)} class="btn btn-xs btn-ghost">-</button>
    
                                    <span>{item.quantity}</span>
                                        <button on:click={() => incrementQuantity(item.variantId || item.id)} class="btn btn-xs btn-ghost">+</button>

       
  

                                    </div>
                                    <span class="w-20 text-right font-mono">{calculateLineTotal(item).toFixed(2)}</span>

                         
       </div>
       
    
                            </div>
                        {/each}
                    </div>
          
      {:else}
                
                    {#if !parseFloat($pmtAmt.replace(/,/g, ''))}
                        <div class="h-full flex items-center justify-center text-center text-base-content/50">
                        <p>Add items, 
load a cart, or use the keypad.</p>
     
                    </div>
       
                     {/if}
                {/if}
            </div>


            <div 
class="mt-auto pt-2 space-y-2">
                <div class="form-control">
                    
       
                  <label class="label cursor-pointer py-1">
         
                        
    <span class="label-text">Apply Tax ({$taxRate}%)</span>
        
                        <input type="checkbox" bind:checked={applyTax} class="toggle toggle-primary toggle-sm" />
  
                   </label>
                </div>
               
 
  
              <div class="form-control">
                        <label class="label cursor-pointer py-1">
      
                      <span class="label-text">Apply 3% Credit Card Fee</span>
                        <input 
type="checkbox" bind:checked={applyCardFee} class="toggle toggle-secondary toggle-sm" />
            
                </label>
                </div>
   
               <div class="flex space-x-2">
                    <button on:click={() => showCustomerModal = true} class="btn btn-info normal-case flex-1 btn-sm">{$selectedCustomer 
?
                        'Change' : 'Add'} Cust.</button>
                    <button on:click={() => showDiscountModal = true} class="btn btn-accent normal-case flex-1 btn-sm">Discount</button>
                    <button on:click={() => showInventoryModal = true} class="btn btn-secondary normal-case flex-1 btn-sm">Add Item</button>
                 </div>
                 <div 
class="flex 
space-x-2">
                     <button on:click={saveCart} class="btn btn-accent normal-case flex-1 btn-sm" disabled={chargeItems.length === 
 
                    0 && !parseFloat($pmtAmt.replace(/,/g, ''))}>Save Cart</button>
                     <button on:click={() => showLoadCartModal = true} class="btn btn-accent normal-case flex-1 btn-sm">Load Cart</button>
            
 
                       {#if chargeItems.length > 0 ||
parseFloat($pmtAmt.replace(/,/g, ''))}
                        <button on:click={clearCharge} class="btn btn-warning normal-case btn-sm">Clear</button>
                    {/if}
                 </div>
                 <div class="flex space-x-2 mt-2">
 
            

                     <button on:click={createQRCode} class="btn btn-primary text-white font-greycliffbold normal-case flex-1">Pay with Crypto</button>
                     <button on:click={payWithCard} class="btn btn-secondary text-white font-greycliffbold normal-case flex-1">Pay with Card</button>
                </div>
                 <button on:click={payWithCashApp} class="btn btn-success w-full font-greycliffbold normal-case">Pay 
with Cash App</button>
            </div>
        </div>

        <div id="pos-input-section" class="flex flex-col md:w-1/2 
h-full">
    
 
            <div class="flex items-center justify-center space-x-2 p-2 bg-base-200 rounded-lg mb-2">

                {#if $selectedMint === "USDC"}
                    <svg 
class="h-8
w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000">
                        <path 
d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 
0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" 
                    fill="#2775ca"/>
                        <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 
16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67
20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 
12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 
16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
                    </svg>
                {:else if $selectedMint === "SOL"}
               
     <img src="{solLogo}" class="w-9" alt="SOL" />
                {:else if $selectedMint === "BONK"}
      
                    <img src="{bonkLogo}" class="w-9 rounded-full" alt="BONK" />
                    {:else}
                    
  <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 
font-bold">?</div>
                {/if}
              
                <input bind:value={$pmtAmt}
                    class="input input-ghost w-full text-right text-2xl md:text-3xl 
                
    font-mono" placeholder="0.00" readonly />
 
            </div>

     
            <div class="space-y-2 mb-2">
                
                <form on:submit|preventDefault={handleBarcodeSubmit} class="input-group">
                    <input type="text" placeholder="Scan Barcode..." class="input input-bordered w-full 
input-sm" bind:value={barcodeInput} />
                    <button type="submit" class="btn 
                    btn-square 
btn-sm">
    
                     
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" 
viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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

    
 
            <div
    class="flex-grow" class:hidden={chargeItems.length > 0}>
   
                <Keyboard custom="{keys}" on:keydown="{onKeydown}" />
            </div>

        </div> 
</div> 
</div>
