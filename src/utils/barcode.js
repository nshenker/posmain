import JsBarcode from 'jsbarcode';

/**
 * Creates an SVG element for a given item's barcode.
 * @param {object} item - The inventory item.
 * @returns {SVGSVGElement} - The generated SVG element.
 */
function createBarcodeSVG(item) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
        JsBarcode(svg, item.barcode, {
            format: "CODE128",
            displayValue: true,
            text: `${item.name}`,
            fontSize: 16,
            margin: 10,
            width: 2,
            height: 60,
        });
    } catch (e) {
        console.error("Error generating barcode for item:", item.name, e);
        // Return an empty SVG on error
    }
    return svg;
}


/**
 * Triggers a browser download for a given Blob.
 * @param {Blob} blob - The data blob to download.
 * @param {string} filename - The desired filename for the download.
 */
function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


/**
 * Generates and saves a single barcode as an SVG file.
 * @param {object} item - The inventory item.
 */
export function saveBarcode(item) {
    if (!item.barcode) return;
    const svg = createBarcodeSVG(item);
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    triggerDownload(blob, `${item.name.replace(/ /g, '_')}-barcode.svg`);
}


/**
 * Generates and saves a single sheet of multiple barcodes as an SVG file.
 * @param {Array<object>} items - An array of inventory items.
 */
export function saveMultipleBarcodes(items) {
    const PADDING = 20;
    const LABEL_WIDTH = 300;
    const LABEL_HEIGHT = 150;
    const COLS = 2;

    const sheet = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    
    items.forEach((item, index) => {
        if (!item.barcode) return;

        const row = Math.floor(index / COLS);
        const col = index % COLS;

        const offsetX = col * (LABEL_WIDTH + PADDING);
        const offsetY = row * (LABEL_HEIGHT + PADDING);
        
        const svg = createBarcodeSVG(item);

        // Create a group for each label and transform it into position
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
        
        // Optional: Add a border for easy cutting
        const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        border.setAttribute('x', 0);
        border.setAttribute('y', 0);
        border.setAttribute('width', LABEL_WIDTH);
        border.setAttribute('height', LABEL_HEIGHT);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', '#ccc');
        border.setAttribute('stroke-dasharray', '5,5');
        
        group.appendChild(border);
        group.appendChild(svg);
        sheet.appendChild(group);
    });
    
    const numRows = Math.ceil(items.length / COLS);
    const totalWidth = COLS * LABEL_WIDTH + (COLS - 1) * PADDING;
    const totalHeight = numRows * LABEL_HEIGHT + (numRows - 1) * PADDING;

    sheet.setAttribute('width', totalWidth);
    sheet.setAttribute('height', totalHeight);
    sheet.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const svgString = new XMLSerializer().serializeToString(sheet);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    triggerDownload(blob, `barcodes-sheet.svg`);
}
