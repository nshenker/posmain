// --- CSV Utilities ---

// Helper function to trigger download
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Converts an array of customer objects to a CSV string
function convertToCSV(data) {
    const headers = ["id", "name", "email", "phone", "address", "notes", "groupId", "loyaltyPoints"];
    const rows = data.map(customer =>
        [
            customer.id || '',
            customer.name || '',
            customer.email || '',
            customer.phone || '',
            `"${(customer.address || '').replace(/"/g, '""')}"`, // Handle commas/quotes in address
            `"${(customer.notes || '').replace(/"/g, '""')}"`, // Handle commas/quotes in notes
            customer.groupId || '',
            customer.loyaltyPoints || 0
        ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

// Specific function to export the customer list
export function exportCustomersToCsv(customers) {
    const csvContent = convertToCSV(customers);
    downloadCSV(csvContent, 'customers.csv');
}

// Specific function to import customers from a CSV file
export function importCustomersFromCsv(file, onComplete) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const text = reader.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 1) {
                onComplete(new Error("CSV file is empty or invalid."), null);
                return;
            }

            const headerLine = lines.shift().trim();
            const headers = headerLine.split(',').map(h => h.trim());
            
            // Validate essential headers
            if (!headers.includes('name')) {
                 onComplete(new Error("CSV must contain a 'name' column."), null);
                return;
            }

            const importedCustomers = lines.map(line => {
                const customerData = line.split(',');
                // Find headers safely, even if columns are out of order
                const loyaltyPoints = customerData[headers.indexOf('loyaltyPoints')] || 0;
                const name = customerData[headers.indexOf('name')] || 'Unnamed Customer';
                const id = customerData[headers.indexOf('id')] || `csv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                const email = customerData[headers.indexOf('email')] || '';
                const phone = customerData[headers.indexOf('phone')] || '';
                const address = customerData[headers.indexOf('address')] || '';
                const notes = customerData[headers.indexOf('notes')] || '';
                const groupId = customerData[headers.indexOf('groupId')] || null;

                return {
                    id: id,
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    notes: notes,
                    groupId: groupId,
                    loyaltyPoints: parseInt(loyaltyPoints, 10) || 0
                };
            });
            onComplete(null, importedCustomers);
        } catch (error) {
            onComplete(error, null);
        }
    };
    reader.onerror = () => {
        onComplete(new Error("Failed to read the file."), null);
    };
    reader.readAsText(file);
}

// --- JSON Utilities ---

// Generic function to export any JS object to a JSON file
export function exportToJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Generic function to import data from a JSON file
export function importFromJSON(file, onComplete) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            onComplete(null, data);
        } catch (error) {
            onComplete(error, null);
        }
    };
     reader.onerror = () => {
        onComplete(new Error("Failed to read the file."), null);
    };
    reader.readAsText(file);
}

// --- Generic CSV Exporter ---

// Function to export any array of flat objects to CSV
export function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        console.error("No data to export.");
        return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(obj =>
        headers.map(header => {
            const value = obj[header];
            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }
            // Handle strings that contain commas, quotes, or newlines
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            // Handle objects/arrays by JSON stringifying them
            if (typeof value === 'object') {
                 try {
                    // Escape quotes within the JSON string
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                 } catch (e) {
                    return '[Object]';
                 }
            }
            return value;
        }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(csvContent, filename);
}


