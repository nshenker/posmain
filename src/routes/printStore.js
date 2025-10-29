import { writable } from 'svelte/store';

// This store will hold the transaction object that needs to be printed
export const receiptToPrint = writable(null);

// This function updates the store and triggers the browser's print dialog via the layout component
export function triggerPrint(transaction) {
    receiptToPrint.set(transaction);
    
    // Use a brief timeout to allow Svelte to render the receipt component in the layout
    setTimeout(() => {
        window.print();
        // Clearing the store is now handled in the layout after printing
    }, 100);
}
