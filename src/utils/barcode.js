import { showToast } from '../routes/toastStore.js';
import jsPDF from 'jspdf';

async function generateBarcode(item, canvas) {
    // Dynamically import JsBarcode only on the client-side
    const JsBarcode = (await import('jsbarcode')).default;
    try {
        JsBarcode(canvas, item.barcode, {
            format: "CODE128",
            displayValue: true,
            text: `${item.name} - $${item.price.toFixed(2)}`
        });
    } catch (e) {
        console.error("Error generating barcode:", e);
        showToast(`Error generating barcode for ${item.name}.`, 'error');
    }
}

export async function saveBarcode(item) {
    if (typeof window === 'undefined') return; // Ensure this only runs in the browser

    const canvas = document.createElement('canvas');
    await generateBarcode(item, canvas);

    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png");
    link.download = `${item.name}-barcode.png`;
    link.click();
}

export async function saveMultipleBarcodes(items) {
    if (typeof window === 'undefined') return; // Ensure this only runs in the browser

    const doc = new jsPDF();
    const margin = 10;
    let x = margin;
    let y = margin;
    const barcodeWidth = 60;
    const barcodeHeight = 30;
    const pageHeight = doc.internal.pageSize.height;

    for (const item of items) {
        if (y + barcodeHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        const canvas = document.createElement('canvas');
        await generateBarcode(item, canvas);
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', x, y, barcodeWidth, barcodeHeight);

        y += barcodeHeight + 5;
    }

    doc.save('barcodes.pdf');
}
