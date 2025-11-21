import { writable } from 'svelte/store';

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
                    parsedStoredValue = parsedStoredValue.map(item => {
                        if (typeof item !== 'object' || item === null) return null;
                        return {
                            id: item.id || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                            name: item.name || 'Unnamed Item',
                            type: item.type || 'simple',
                            variants: item.variants || [],
                            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                            price: typeof item.price === 'number' ? item.price : 0,
                            cost: typeof item.cost === 'number' ? item.cost : 0,
                            currency: item.currency || 'USDC',
                            category: item.category || 'Default',
                            locationId: item.locationId || null,
                            sku: item.sku || '',
                            barcode: item.barcode || '',
                            loyaltyPoints: typeof item.loyaltyPoints === 'number' ? item.loyaltyPoints : 0,
                            ...item,
                        };
                    }).filter(item => item !== null);
                    initialValue = parsedStoredValue;
                } else {
                    initialValue = parsedStoredValue;
                }
            } catch (e) {
                console.error("Failed to parse stored value for key:", key, e);
                initialValue = startValue;
            }
        }
    }

    const store = writable(initialValue);

    if (isBrowser) {
        store.subscribe(value => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                 console.error(`Failed to save value to localStorage for key "${key}":`, e);
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

export const mints = writable([
    {name:"SOL", mint:"So11111111111111111111111111111111111111112", coingeckoId: "solana", decimals: 9},
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", coingeckoId: "usd-coin", decimals: 6},
    {name:"USDT", mint:"Es9vd8U5g4NjTqjHdf6L8RnbM5nFfX7yJkM2R3B8N2S", coingeckoId: "tether", decimals: 6},
]);

// CHANGED: Default to "SOL" to ensure compatibility with all wallets out-of-the-box
export const selectedMint = createPersistentStore("selectedMint", "SOL");

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

// --- Loyalty & Discounts ---
export const loyaltyRedemptionRate = createPersistentStore("loyaltyRedemptionRate", { points: 100, discount: 10 });
export const coupons = createPersistentStore("coupons", []);
export const cartDiscount = writable(null);

// --- Inventory & Invoicing ---
export const inventory = createPersistentStore("inventory", []);
export const categories = createPersistentStore("categories", ["Default"]);
export const locations = createPersistentStore("locations", []);
export const inventoryHistory = createPersistentStore("inventoryHistory", {});
export const invoices = createPersistentStore("invoices", []);
export const customers = createPersistentStore("customers", []);
export const customerGroups = createPersistentStore("customerGroups", []);
export const currentChargeItems = createPersistentStore("currentChargeItems", []);
export const savedCarts = createPersistentStore("savedCarts", []);
export const lastBackupDate = createPersistentStore("lastBackupDate", null);

// --- User Management ---
export const employees = createPersistentStore("employees", []);
export const currentUser = writable(null);
export const timeClockEvents = createPersistentStore("timeClockEvents", []);

export const barcodeScanned = writable(null);
export const chargeMetadata = writable(null);
