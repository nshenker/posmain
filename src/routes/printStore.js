import { writable } from 'svelte/store';

// This store will hold the transaction object that needs to be printed
export const receiptToPrint = writable(null);

// This function updates the store and triggers the browser's print dialog
export function triggerPrint(transaction) {
    receiptToPrint.set(transaction);
    
    // Use a brief timeout to allow Svelte to render the receipt component in the layout
    setTimeout(() => {
        window.print();
        receiptToPrint.set(null); // Clear the store after printing
    }, 100);
}
