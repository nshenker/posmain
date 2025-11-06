import { writable } from 'svelte/store';

// Helper to merge a stored layout with the default, ensuring new widgets are added for existing users.
const mergeLayouts = (storedLayout, defaultLayout) => {
// ... (unchanged logic)
    const defaultWidgetsMap = new Map(defaultLayout.widgets.map(w => [w.id, w]));
    const storedWidgetsMap = new Map(storedLayout.widgets.map(w => [w.id, w]));

    const mergedWidgets = defaultLayout.widgets.map(defaultWidget => {
        const storedWidget = storedWidgetsMap.get(defaultWidget.id);
        // If the user has a stored setting for this widget, use it. Otherwise, use the default.
        return storedWidget ? storedWidget : defaultWidget;
    });

    // Ensure *all* default widgets are present, adding any missing ones
    defaultWidgetsMap.forEach((defaultWidget, id) => {
        if (!mergedWidgets.some(w => w.id === id)) {
            mergedWidgets.push(defaultWidget);
        }
    });


    return { widgets: mergedWidgets };
};


// Helper to create a writable store that syncs with localStorage
const createPersistentStore = (key, startValue) => {
    const isBrowser = typeof window !== 'undefined';
    let initialValue = startValue;

    if (isBrowser) {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                let parsedStoredValue = JSON.parse(storedValue);

                // --- DATA MIGRATION & VALIDATION ---
                if (key === 'inventory' && Array.isArray(parsedStoredValue)) {
                    // Fix for inventory data corruption
                    parsedStoredValue = parsedStoredValue.map(item => {
                         // Check if item is a valid object, skip if not
                        if (typeof item !== 'object' || item === null) {
                            console.warn(`Invalid item found in inventory store, skipping:`, item);
                            return null; // Mark invalid items as null
                        }
                        // Ensure essential properties exist with defaults
                        return {
                            id: item.id || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate ID if missing
                            name: item.name || 'Unnamed Item',
                            type: item.type || 'simple',
                            variants: item.variants && Array.isArray(item.variants) ? item.variants : [],
                            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                            price: typeof item.price === 'number' ? item.price : 0,
                            cost: typeof item.cost === 'number' ? item.cost : 0,
                            currency: item.currency || 'USDC',
                            category: item.category || 'Default',
                            locationId: item.locationId || null,
                            sku: item.sku || '',
                            barcode: item.barcode || '',
                            loyaltyPoints: typeof item.loyaltyPoints === 'number' ? item.loyaltyPoints : 0,
                            // Preserve any other properties the item might have
                            ...item,
                        };
                    }).filter(item => item !== null); // Filter out any invalid items marked as null
                    
                    initialValue = parsedStoredValue; // Assign migrated data

                } else if (key === 'dashboardLayout') {
                    // If this is the dashboardLayout store, merge it to handle updates.
                    initialValue = mergeLayouts(parsedStoredValue, startValue);
                } else {
                    // For all other stores (like successArray)
                    initialValue = parsedStoredValue;
                }
                // --- END OF MIGRATION & VALIDATION ---

            } catch (e) {
                console.error("Failed to parse stored value for key:", key, e);
                 // Clear corrupted data from localStorage
                if (isBrowser) {
                    try {
                        localStorage.removeItem(key);
                        console.log(`Removed potentially corrupted localStorage item for key: ${key}`);
                    } catch (removeError) {
                        console.error(`Failed to remove corrupted localStorage item for key: ${key}`, removeError);
                    }
                }
                initialValue = startValue; // Fallback to default on parse error
            }
        }
    }

    const store = writable(initialValue);

    if (isBrowser) {
        store.subscribe(value => {
            try {
                // Add error handling for saving to localStorage
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                 console.error(`Failed to save value to localStorage for key "${key}":`, e);
                 // Potentially notify user if storage fails (e.g., quota exceeded)
            }
        });
    }

    return store;
};

// --- Core App Stores ---
export const storeName = createPersistentStore("storeName", "");
export const publicKey = createPersistentStore("publicKey", "");
export const pmtAmt = createPersistentStore("pmtAmt", "");
export const mostRecentTxn = createPersistentStore("mostRecentTxn", "");
export const showWarning = createPersistentStore("showWarning", true);
export const fullScreen = createPersistentStore("fullScreen", false);
export const successArray = createPersistentStore("successArray", []);

// Simplified the mints array to only include USDC, SOL, and BONK
export const mints = writable([
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", coingeckoId: "usd-coin", decimals: 6},
    {name:"SOL", mint:"So11111111111111111111111111111111111111112", coingeckoId: "solana", decimals: 9},
    {name:"BONK", mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", coingeckoId: "bonk", decimals: 5},
]);

export const selectedMint = createPersistentStore("selectedMint", "USDC");
export const merchantLogo = createPersistentStore("merchantLogo", "");
export const businessAddress = createPersistentStore("businessAddress", "");
export const theme = createPersistentStore("theme", "light");

// --- POS Settings ---
export const taxRate = createPersistentStore("taxRate", 8.875);
export const defaultTaxable = createPersistentStore("defaultTaxable", true);
export const stripePublishableKey = createPersistentStore("stripePublishableKey", "");
export const stripeSecretKey = createPersistentStore("stripeSecretKey", "");
export const chargeCardFee = createPersistentStore("chargeCardFee", false);
export const selectedCustomer = createPersistentStore("selectedCustomer", null);

// --- NEW LOYALTY SETTINGS STORE ---
export const loyaltyRedemptionRate = createPersistentStore("loyaltyRedemptionRate", { points: 100, discount: 10 });
// --- END NEW STORE ---

// --- NEW DISCOUNT & COUPON STORES ---
export const coupons = createPersistentStore("coupons", []); // { id, code, type, value, isActive }
export const cartDiscount = writable(null); // { type, value, code }
// --- END NEW STORES ---


// --- Inventory & Invoicing Stores ---
export const inventory = createPersistentStore("inventory", []);
export const categories = createPersistentStore("categories", ["Default"]);
export const locations = createPersistentStore("locations", []);
export const inventoryHistory = createPersistentStore("inventoryHistory", {}); // { itemId: [ { date, reason, change, newQty } ] }
export const invoices = createPersistentStore("invoices", []);
export const customers = createPersistentStore("customers", [
    // { id: '1', name: 'Walk-in Customer', email: '', phone: '', address: '', notes: '', groupId: null, loyaltyPoints: 0 }
]);
export const customerGroups = createPersistentStore("customerGroups", []);
export const currentChargeItems = createPersistentStore("currentChargeItems", []); // Holds items for the current transaction
export const savedCarts = createPersistentStore("savedCarts", []); // Stores an array of { id, name, items, customerId, applyTax }
export const lastBackupDate = createPersistentStore("lastBackupDate", null);

// --- User Management ---
export const employees = createPersistentStore("employees", []);
export const currentUser = writable(null);
export const timeClockEvents = createPersistentStore("timeClockEvents", []); // { employeeId, employeeName, type, timestamp }

// NEW: Store for global barcode scanner
export const barcodeScanned = writable(null);

// A temporary store to pass charge metadata to the payment page
export const chargeMetadata = writable(null);


// Removed dashboardLayout store as it is no longer used for a dynamic grid.
