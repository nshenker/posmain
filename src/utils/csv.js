import { customers } from '../routes/stores.js';
import { showToast } from '../routes/toastStore.js';

export function exportCustomersToCsv(customerData) {
    if (!customerData || customerData.length === 0) {
        showToast('No customer data to export.', 'info');
        return;
    }

    const headers = ['id', 'name', 'email', 'phone', 'wallet', 'notes', 'tags'];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    customerData.forEach(customer => {
        const row = headers.map(header => {
            let value = customer[header];
            if (Array.isArray(value)) {
                value = value.join(';'); // Use a semicolon to separate multiple tags
            }
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`; // Add quotes to values with commas
            }
            return value;
        });
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function importCustomersFromCsv() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = event => {
                const csvData = event.target.result;
                const lines = csvData.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const newCustomers = [];

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length === headers.length) {
                        const customer = {};
                        headers.forEach((header, index) => {
                            let value = values[index];
                            if (value.startsWith('"') && value.endsWith('"')) {
                                value = value.slice(1, -1);
                            }
                            if (header === 'tags') {
                                value = value ? value.split(';') : [];
                            }
                            customer[header] = value;
                        });
                        newCustomers.push(customer);
                    }
                }

                customers.update(existingCustomers => {
                    const customerMap = new Map(existingCustomers.map(c => [c.id, c]));
                    newCustomers.forEach(nc => customerMap.set(nc.id, nc));
                    return Array.from(customerMap.values());
                });

                showToast(`${newCustomers.length} customers imported successfully.`, 'success');
            };
            reader.readAsText(file);
        }
    };
    input.click();
}
