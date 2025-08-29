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
export const mints = writable([
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},
    {name:"DUST", mint:"DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"},
    {name:"FOXY", mint:"FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq"},
    {name:"JOINTS", mint:"7ftKSttU6yUAnWsWxpRP3LKdQNEto8V4KD9NuWttoVnV"},
    {name:"USDT", mint:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},
    {name:"SOL", mint:"So11111111111111111111111111111111111111112"},
    {name:"BONK", mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"}]);
export const selectedMint = createPersistentStore("selectedMint", "USDC");
export const merchantLogo = createPersistentStore("merchantLogo", "");
export const theme = createPersistentStore("theme", "light");

// New stores for inventory and invoicing
export const inventory = createPersistentStore("inventory", []);
export const invoices = createPersistentStore("invoices", []);
