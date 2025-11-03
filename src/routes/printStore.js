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
    
    // REMOVED window.print() CALL: The Receipt.svelte component handles the print call.
}

// NEW FUNCTION: Triggers browser print for the invoice
// REMOVED window.print() CALL: InvoicePrintable.svelte handles the call after QR rendering.
export function triggerInvoicePrint(invoice, storeName, businessAddress, publicKey, mints, solanaPayUrl) {
    // Clear any pending receipt print
    receiptToPrint.set(null); 
    // Pass the entire invoice object and store details needed for the printable component
    invoiceToPrint.set({ invoice, storeName, businessAddress, publicKey, mints, solanaPayUrl }); // MODIFIED: Changed qrCodeBase64 to solanaPayUrl
    
    // REMOVED window.print() CALL: The printable component will call print() after rendering.
}
