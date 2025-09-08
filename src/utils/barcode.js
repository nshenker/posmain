import JsBarcode from 'jsbarcode';

function generateBarcodeSVG(item) {
    const container = document.createElement('div');
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.appendChild(svg);
    
    try {
        JsBarcode(svg, item.barcode, {
            format: "CODE128",
            displayValue: true,
            text: `${item.name} - $${item.price}`,
            fontSize: 14,
            margin: 10
        });
        return container.innerHTML;
    } catch (e) {
        console.error("Error generating barcode for item:", item.name, e);
        return `<p>Invalid barcode for ${item.name}</p>`;
    }
}

export function printBarcode(item) {
    const barcodeHTML = generateBarcodeSVG(item);
    
    const printWindow = window.open('', 'PRINT', 'height=400,width=600');
    printWindow.document.write('<html><head><title>Print Barcode</title></head><body>');
    printWindow.document.write(barcodeHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

export function printMultipleBarcodes(items) {
    const printWindow = window.open('', 'PRINT', 'height=800,width=600');
    printWindow.document.write('<html><head><title>Print Barcodes</title>');
    printWindow.document.write(`
        <style>
            @media print {
                @page { margin: 0.5in; }
                body { margin: 0; }
                .barcode-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    page-break-inside: avoid;
                }
                .barcode-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                svg {
                    width: 100%;
                }
            }
        </style>
    `);
    printWindow.document.write('</head><body><div class="barcode-container">');

    items.forEach(item => {
        if (item.barcode) {
             const barcodeHTML = generateBarcodeSVG(item);
             printWindow.document.write(`<div class="barcode-item">${barcodeHTML}</div>`);
        }
    });

    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}
