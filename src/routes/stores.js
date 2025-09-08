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
                const parsedStoredValue = JSON.parse(storedValue);
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

export const storeName = createPersistentStore("storeName", "");
export const publicKey = createPersistentStore("publicKey", "");
export const pmtAmt = createPersistentStore("pmtAmt", "");
export const mostRecentTxn = createPersistentStore("mostRecentTxn", "");
export const showWarning = createPersistentStore("showWarning", true);
export const fullScreen = createPersistentStore("fullScreen", false);
export let successArray = createPersistentStore("successArray", []);

// Simplified the mints array to only include USDC, SOL, and BONK
export const mints = writable([
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", coingeckoId: "usd-coin"},
    {name:"SOL", mint:"So11111111111111111111111111111111111111112", coingeckoId: "solana"},
    {name:"BONK", mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", coingeckoId: "bonk"},
    {name:"HNT", mint:"hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", coingeckoId: "helium"}
]);

export const selectedMint = createPersistentStore("selectedMint", "USDC");
export const merchantLogo = createPersistentStore("merchantLogo", "");
export const theme = createPersistentStore("theme", "light");

// --- Inventory & Invoicing Stores ---
export const inventory = createPersistentStore("inventory", []);
export const categories = createPersistentStore("categories", ["Default"]);
export const inventoryHistory = createPersistentStore("inventoryHistory", {}); // { itemId: [ { date, reason, change, newQty } ] }
export const invoices = createPersistentStore("invoices", []);
export const currentChargeItems = createPersistentStore("currentChargeItems", []); // Holds items for the current transaction


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
