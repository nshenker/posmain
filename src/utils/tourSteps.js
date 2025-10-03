import { goto } from '$app/navigation';

const switchTab = (page, tabIndex) => {
    let selector;
    if (page === 'pos') {
        // New unified tab structure for POS
        selector = `.tabs-bordered button:nth-child(${tabIndex + 1})`;
    } else if (page === 'inventory') {
        // Inventory tabs
        selector = `#inventory-tabs button:nth-child(${tabIndex + 1})`;
    }

    const tabButton = document.querySelector(selector);
    if (tabButton) {
        tabButton.click();
    }
};

export const tourSteps = (tour) => [
    // --- Dashboard: Overview ---
    {
        id: 'welcome',
        title: "Welcome to PoSolana Suite",
        text: "This is the official tour to guide you through the complete functionality of your decentralized Point of Sale application.",
        attachTo: { element: '#dashboard-header', on: 'bottom' },
        buttons: [{ text: 'Start Tour', action: tour.next }]
    },
    {
        id: 'dashboard-metrics',
        title: "Your Key Metrics",
        text: "The dashboard provides a real-time summary of your performance. All revenue figures are automatically converted to their USD value using live price feeds for accuracy.",
        attachTo: { element: '.stats', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'dashboard-widgets',
        title: "Customizable Widgets",
        text: "The dashboard is built from a grid of customizable widgets. Use the 'Edit Widgets' button above to choose which modules, like sales charts and inventory alerts, are visible to you.",
        attachTo: { element: '#dashboard-grid', on: 'top' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: POS', action: tour.next }
        ]
    },
    {
        id: 'dashboard-nav',
        title: "Main Navigation",
        text: "These cards serve as quick links to the primary application modules. Let's begin by exploring the Point of Sale system.",
        attachTo: { element: '#dashboard-nav-cards', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Point of Sale', action: () => goto('/pos') }
        ]
    },

    // --- Point of Sale (POS): Create Charge (Tab 1) ---
    {
        id: 'pos-intro',
        title: "Point of Sale (POS) Overview",
        text: "This page is the heart of your business, split into three tabs: Create Charge, Transactions, and Settings. We will go through them in order.",
        attachTo: { element: '.tabs-bordered', on: 'bottom' },
        buttons: [
            { text: 'Back', action: () => goto('/dashboard'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-create-charge',
        title: "Creating a Charge",
        text: "You can build a customer's cart using the 'Add Item' button, scan a barcode, or use the keypad. Notice the new 'Apply Tax' toggle, which lets you control sales tax on a per-transaction basis.",
        attachTo: { element: '#pos-input-section', on: 'left' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Transactions', action: () => { 
                switchTab('pos', 1); // Switch to the 'Transactions' tab
                tour.next(); 
            } }
        ]
    },
    
    // --- Point of Sale (POS): Transactions (Tab 2) ---
    {
        id: 'pos-transactions-list',
        title: "Sales History",
        text: "This table shows a detailed log of all successful sales. You can now expand each transaction to see a breakdown of the specific items and variants purchased.",
        attachTo: { element: '.table.w-full', on: 'top' }, // Targeting the table in Transactions.svelte
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Settings', action: () => { 
                switchTab('pos', 2); // Switch to the 'Settings' tab
                tour.next(); 
            } }
        ]
    },

    // --- Point of Sale (POS): Settings (Tab 3) ---
    {
        id: 'pos-settings-wallet',
        title: "Store & Tax Settings",
        text: "Here you can set your wallet, logo, and business address. We've also added a new section to define your sales tax rate and set whether tax should be applied by default.",
        attachTo: { element: '.card-body > div:nth-child(3)', on: 'left' }, // Targeting the first control (warning toggle)
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Data Management', action: tour.next }
        ]
    },
    {
        id: 'pos-settings-data',
        title: "Data Management & Backup",
        text: "Since all your data is stored locally in the browser, regular backups are critical. The export function now includes all your new settings and product variant data.",
        attachTo: { element: '#data-management-section', on: 'top' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Invoicing', action: () => goto('/invoicing') }
        ]
    },

    // --- Invoicing: Detail & Actions ---
    {
        id: 'invoicing-intro',
        title: "Invoicing: Create & Manage",
        text: "The Invoicing page lets you create professional, digital invoices. Start by selecting a customer or entering a new one. The real-time invoice preview is on the right.",
        attachTo: { element: '#invoice-details-card', on: 'right' },
        buttons: [
            { text: 'Back', action: () => goto('/pos'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'invoicing-items',
        title: "Adding Items to the Invoice",
        text: "You can quickly populate the invoice by either selecting items directly from your inventory, or by manually adding a custom line item with a specified name, quantity, and price.",
        attachTo: { element: '#add-from-inventory-title', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'invoicing-actions',
        title: "Payment Link & Exports",
        text: "The main invoice preview allows you to generate a unique Solana Pay QR code, print the invoice, or download it as a professional PDF document for your client.",
        attachTo: { element: '#invoice-actions-container', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'invoicing-table',
        title: "Saved Invoices List",
        text: "All of your saved invoices are tracked here. The system continuously checks the Solana network for payment confirmation and automatically updates the status from 'Unpaid' to 'Paid.'",
        attachTo: { element: '#saved-invoices-card', on: 'top' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Inventory', action: () => goto('/inventory') }
        ]
    },

    // --- Inventory: Management ---
    {
        id: 'inventory-intro',
        title: "Inventory Management",
        text: "Your digital stockroom is organized into three powerful tabs: Inventory (item list), Categories, and Reports. We will proceed through the tabs in order.",
        attachTo: { element: '#inventory-tabs', on: 'bottom' },
        buttons: [
            { text: 'Back', action: () => goto('/invoicing'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-add',
        title: "Add New Products",
        text: "Use this form to add products. You can now choose between 'Simple' products with a single stock count, or 'Variable' products for items with different options, like sizes or colors.",
        attachTo: { element: '#add-item-card', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-variants',
        title: "Product Variants",
        text: "When creating a 'Variable' product, you can define attributes (like 'Size') and their values (e.g., 'Small, Medium, Large'). This will generate a list of all possible product variations, allowing you to set a unique price and quantity for each one.",
        attachTo: { element: 'div.space-y-4.p-4.border.rounded-lg.bg-base-200', on: 'bottom' },
         when: {
            show: () => {
                // This step should only appear if the "Variable" product type is selected
                const select = document.querySelector('select');
                if (select) {
                    select.value = 'variable';
                    select.dispatchEvent(new Event('change'));
                }
            }
        },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-management',
        title: "Stock Management & History",
        text: "From the item list, you can see all your products, including their type and total stock. You can perform quick manual stock adjustments, view a comprehensive inventory history log for every change, and save or print barcode labels.",
        attachTo: { element: '.table.w-full.responsive-table', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Inventory Reports', action: () => { 
                switchTab('inventory', 2); 
                tour.next(); 
            } }
        ]
    },
    {
        id: 'inventory-reports-view',
        title: "Inventory Reports",
        text: "This section provides valuable business insights, such as Inventory Valuation (total stock cost), Sales Velocity, and Dead Stock (unsold items).",
        attachTo: { element: '.card-body p.text-sm.text-gray-500:first-child', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: CRM', action: () => goto('/crm') }
        ]
    },
    
    // --- CRM: Customer Management ---
    {
        id: 'crm-intro',
        title: "Customer Relationship Management (CRM)",
        text: "The CRM is your central hub for managing customer profiles. It tracks total spending, communication logs, and all contact and wallet information for each client.",
        attachTo: { element: '#crm-table', on: 'top' },
        buttons: [
            { text: 'Back', action: () => goto('/inventory'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'crm-actions',
        title: "Tools & Segmentation",
        text: "Use this panel to filter the customer list by tags or custom groups, and manage your database by importing or exporting your customer data via CSV.",
        attachTo: { element: '#crm-actions', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Analytics', action: () => goto('/analytics') }
        ]
    },

    // --- Analytics: Data-Driven Decisions ---
    {
        id: 'analytics-intro',
        title: "Analytics & Reporting",
        text: "The Analytics page is where you transform sales data into actionable business intelligence with various charts and profitability metrics.",
        attachTo: { element: '#analytics-header', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'analytics-filter',
        title: "Filtering & Export",
        text: "All data displayed can be filtered by a specific time frame, and the raw sales report can be downloaded as a comprehensive CSV file for detailed external analysis.",
        attachTo: { element: '#analytics-controls', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'analytics-charts',
        title: "Performance Breakdowns",
        text: "Review visual breakdowns for sales by token, sales over time, profitability, and top-selling products to gain a complete picture of your store's performance.",
        attachTo: { element: '.space-y-6 > .grid', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Finish Tour', action: tour.complete }
        ]
    }
];
