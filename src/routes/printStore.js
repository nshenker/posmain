import { writable } from 'svelte/store';

// This store will hold the transaction object that needs to be printed
export const receiptToPrint = writable(null);

// NEW: Store for invoice printing
export const invoiceToPrint = writable(null);

// This function updates the store and triggers the browser's print dialog via the layout component
export function triggerPrint(transaction) {
    // Clear any pending invoice print
    invoiceToPrint.set(null); 
    receiptToPrint.set(transaction);
    
    // Use a brief timeout to allow Svelte to render the receipt component in the layout
    setTimeout(() => {
        window.print();
        // Clearing the store is now handled in the layout after printing
    }, 100);
}

// NEW FUNCTION: Triggers browser print for the invoice
export function triggerInvoicePrint(invoice, storeName, businessAddress) {
    // Clear any pending receipt print
    receiptToPrint.set(null); 
    // Pass the entire invoice object and store details needed for the printable component
    invoiceToPrint.set({ invoice, storeName, businessAddress });

    setTimeout(() => {
        window.print();
    }, 100);
}
