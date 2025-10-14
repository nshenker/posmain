import { writable } from 'svelte/store';

// Helper to merge a stored layout with the default, ensuring new widgets are added for existing users.
const mergeLayouts = (storedLayout, defaultLayout) => {
    if (!storedLayout || !Array.isArray(storedLayout.widgets)) {
        return defaultLayout;
    }

    const defaultWidgetsMap = new Map(defaultLayout.widgets.map(w => [w.id, w]));
    const storedWidgetsMap = new Map(storedLayout.widgets.map(w => [w.id, w]));

    const mergedWidgets = defaultLayout.widgets.map(defaultWidget => {
        const storedWidget = storedWidgetsMap.get(defaultWidget.id);
        // If the user has a stored setting for this widget, use it. Otherwise, use the default.
        return storedWidget ? storedWidget : defaultWidget;
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
                
                // --- DATA MIGRATION FIX ---
                // This block automatically updates old inventory items to the new structure.
                if (key === 'inventory' && Array.isArray(parsedStoredValue)) {
                    parsedStoredValue = parsedStoredValue.map(item => {
                        // Ensure every item has a 'type' and 'variants' property to prevent errors
                        return {
                            ...item,
                            type: item.type || 'simple',
                            variants: item.variants || [],
                        };
                    });
                }
                // --- END OF FIX ---

                // If this is the dashboardLayout store, merge it to handle updates.
                if (key === 'dashboardLayout') {
                    initialValue = mergeLayouts(parsedStoredValue, startValue);
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
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
};

// Helper to create a writable store that syncs with sessionStorage
const createSessionStore = (key, startValue) => {
    const isBrowser = typeof window !== 'undefined';
    let initialValue = startValue;

    if (isBrowser) {
        const storedValue = sessionStorage.getItem(key);
        if (storedValue) {
            try {
                initialValue = JSON.parse(storedValue);
            } catch(e) {
                console.error("Failed to parse session value for key:", key, e);
                initialValue = startValue;
            }
        }
    }
    
    const store = writable(initialValue);

    if (isBrowser) {
        store.subscribe(value => {
            if (value === null || value === undefined) {
                sessionStorage.removeItem(key);
            } else {
                sessionStorage.setItem(key, JSON.stringify(value));
            }
        });
    }

    return store;
};

export const storeName = createPersistentStore("storeName", "");
export const publicKey = createPersistentStore("publicKey", "");
export const pmtAmt = createPersistentStore("pmtAmt", "");
export const mostRecentTxn = createPersistentStore("mostRecentTxn", "");
export const showWarning = createPersistentStore("showWarning", true);
export const fullScreen = createPersistentStore("fullScreen", false);
export let successArray = createPersistentStore("successArray", []);

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
export const taxRate = createPersistentStore("taxRate", 8.875);
export const defaultTaxable = createPersistentStore("defaultTaxable", true);
export const stripePublishableKey = createPersistentStore("stripePublishableKey", "");
export const stripeSecretKey = createPersistentStore("stripeSecretKey", "");
export const chargeCardFee = createPersistentStore("chargeCardFee", false);
export const selectedCustomer = createPersistentStore("selectedCustomer", null);


// --- Inventory & Invoicing Stores ---
export const inventory = createPersistentStore("inventory", []);
export const categories = createPersistentStore("categories", ["Default"]);
export const locations = createPersistentStore("locations", []);
export const inventoryHistory = createPersistentStore("inventoryHistory", {}); // { itemId: [ { date, reason, change, newQty } ] }
export const invoices = createPersistentStore("invoices", []);
export const customers = createPersistentStore("customers", []);
export const customerGroups = createPersistentStore("customerGroups", []);
export const currentChargeItems = createPersistentStore("currentChargeItems", []); // Holds items for the current transaction
export const lastBackupDate = createPersistentStore("lastBackupDate", null);

// --- User Management ---
export const employees = createPersistentStore("employees", []);
export const currentUser = createSessionStore("currentUser", null);
export const timeClockEvents = createPersistentStore("timeClockEvents", []); // { employeeId, employeeName, type, timestamp }

// A temporary store to pass charge metadata to the payment page
export const chargeMetadata = writable(null);


// New store for dashboard layout
export const dashboardLayout = createPersistentStore("dashboardLayout", {
    widgets: [
        { id: 'keyMetrics', name: 'Key Metrics', visible: true },
        { id: 'recentTransactions', name: 'Recent Transactions', visible: true },
        { id: 'salesByToken', name: 'Sales by Token', visible: true },
        { id: 'salesOverTime', name: 'Sales Over Time', visible: true },
        { id: 'lowStockAlerts', name: 'Low Stock Alerts', visible: true },
        { id: 'pendingInvoices', name: 'Pending Invoices', visible: true },
        { id: 'tokenPriceCharts', name: 'Token Price Charts', visible: true }
    ]
});
