import { writable } from 'svelte/store';

// Helper to create a writable store that syncs with localStorage
const createPersistentStore = (key, startValue) => {
    const isBrowser = typeof window !== 'undefined';
    const storedValue = isBrowser ? localStorage.getItem(key) : null;
    const initialValue = storedValue ? JSON.parse(storedValue) : startValue;

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
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},
    {name:"SOL", mint:"So11111111111111111111111111111111111111112"},
    {name:"BONK", mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"},
    {name:"HNT", mint:"hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux"}
]);

export const selectedMint = createPersistentStore("selectedMint", "USDC");
export const merchantLogo = createPersistentStore("merchantLogo", "");
export const theme = createPersistentStore("theme", "light");

// New stores for inventory and invoicing
export const inventory = createPersistentStore("inventory", []);
export const invoices = createPersistentStore("invoices", []);
