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
        title: "Welcome to the PoSolana Suite!",
        text: "This guided tour will walk you through all the powerful features of your new, fully decentralized business management platform. Let's get started!",
        attachTo: { element: '#dashboard-header', on: 'bottom' },
        buttons: [{ text: 'Start Tour', action: tour.next }]
    },
    {
        id: 'dashboard-metrics',
        title: "Your Business At a Glance",
        text: "This is your command center. The Key Metrics widget gives you a real-time summary of your store's performance. All revenue figures are automatically converted to their current USD value using live price feeds, so you always know exactly how you're doing.",
        attachTo: { element: '.stats', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'dashboard-widgets',
        title: "A Personalized Command Center",
        text: "The dashboard is made of modular widgets like sales charts and low stock alerts. You can use the 'Edit Widgets' button to customize your layout and prioritize the data that's most important to your business.",
        attachTo: { element: '#dashboard-grid', on: 'top' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'dashboard-nav',
        title: "Navigating the Suite",
        text: "These cards are your quick links to the core sections of the application. Let's dive into the most important one: the Point of Sale.",
        attachTo: { element: '#dashboard-nav-cards', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Point of Sale', action: () => goto('/pos') }
        ]
    },

    // --- Point of Sale (POS) ---
    {
        id: 'pos-intro',
        title: "The Point of Sale (POS)",
        text: "This is the heart of your daily operations. We've organized it into three simple tabs: 'Charge' for new sales, 'Transactions' for your history, and 'Settings' for configuration.",
        attachTo: { element: '.tabs-bordered', on: 'bottom' },
        buttons: [
            { text: 'Back', action: () => goto('/dashboard'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-create-charge',
        title: "Accepting Payments",
        text: "Here, you can build a customer's cart by adding items, scanning barcodes, or using the keypad for custom amounts. You can apply sales tax on the fly and, most importantly, you can accept both Crypto and Credit Card payments, giving your customers maximum flexibility.",
        attachTo: { element: '#pos-input-section', on: 'left' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Transactions', action: () => { 
                switchTab('pos', 1);
                tour.next(); 
            } }
        ]
    },
    {
        id: 'pos-transactions-list',
        title: "Your Complete Sales History",
        text: "This is your digital ledger. Every sale, whether crypto or card, is recorded here. You can now expand each transaction to see a breakdown of the specific items and variants purchased.",
        attachTo: { element: '.table.w-full', on: 'top' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Settings', action: () => { 
                switchTab('pos', 2);
                tour.next(); 
            } }
        ]
    },
    {
        id: 'pos-settings-general',
        title: "General Store Settings",
        text: "This first section lets you customize your store's identity. You can set your default crypto currency for charges, upload your brand logo, and add your business address, which will appear on printed receipts.",
        attachTo: { element: '#tour-settings-general', on: 'right' },
        buttons: [
            { text: 'Back', action: () => { switchTab('pos', 1); tour.back(); }, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-settings-tax',
        title: "Tax Configuration",
        text: "Here you can define your local sales tax rate and choose whether tax should be applied by default on the checkout page. This gives you full control over how you handle taxes for your business.",
        attachTo: { element: '#tour-settings-tax', on: 'right' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-settings-stripe',
        title: "Credit Card Payments",
        text: "To accept credit card payments, simply enter your Stripe API keys here. This integration is secure and allows you to serve customers who prefer traditional payment methods.",
        attachTo: { element: '#tour-settings-stripe', on: 'right' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-settings-data',
        title: "Data Management & Backups",
        text: "Since all your data is stored locally in your browser, regular backups are critical. Use the 'Export Data' button to download a complete backup of your store, including all settings, products, and transaction history.",
        attachTo: { element: '#tour-settings-data', on: 'right' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Invoicing', action: () => goto('/invoicing') }
        ]
    },


    // --- Invoicing ---
    {
        id: 'invoicing-intro',
        title: "Professional Invoicing",
        text: "Create, manage, and track professional invoices for your clients. You can pull customers directly from your CRM, add items from your inventory, and see a live preview of the invoice as you build it.",
        attachTo: { element: '#invoice-details-card', on: 'right' },
        buttons: [
            { text: 'Back', action: () => goto('/pos'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'invoicing-table',
        title: "Automated Payment Tracking",
        text: "Your saved invoices are listed here. The system automatically monitors the Solana network for payments and updates an invoice's status from 'Unpaid' to 'Paid' the moment a client pays, so you don't have to.",
        attachTo: { element: '#saved-invoices-card', on: 'top' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Inventory', action: () => goto('/inventory') }
        ]
    },

    // --- Inventory ---
    {
        id: 'inventory-intro',
        title: "Advanced Inventory Management",
        text: "This is your digital stockroom. It's designed to handle everything from simple products to complex items with multiple variations.",
        attachTo: { element: '#inventory-tabs', on: 'bottom' },
        buttons: [
            { text: 'Back', action: () => goto('/invoicing'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-add',
        title: "Simple vs. Variable Products",
        text: "When adding an item, you can choose its type. 'Simple' is for standard products with one price and stock count. 'Variable' is for items with different options, like a t-shirt that comes in multiple sizes and colors.",
        attachTo: { element: '#add-item-card', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
     {
        id: 'inventory-management',
        title: "Detailed Stock Control",
        text: "The main inventory list gives you a clear overview of all your products. For variable items, you can expand the entry to see and manage the stock for each individual variant. Every stock change is automatically logged, giving you a complete audit trail.",
        attachTo: { element: '.table.w-full', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: CRM', action: () => goto('/crm') }
        ]
    },
    
    // --- CRM ---
    {
        id: 'crm-intro',
        title: "Customer Relationship Management (CRM)",
        text: "The CRM is your central hub for building strong customer relationships. It automatically tracks each customer's total spending and full purchase history, including the specific product variants they bought.",
        attachTo: { element: '#crm-table', on: 'top' },
        buttons: [
            { text: 'Back', action: () => goto('/inventory'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'crm-actions',
        title: "Segmentation and Data Tools",
        text: "Use this panel to filter your customer list by tags or custom groups for targeted marketing. You can also manage your entire database by importing or exporting your customer data via CSV at any time.",
        attachTo: { element: '#crm-actions', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Analytics', action: () => goto('/analytics') }
        ]
    },

    // --- Analytics ---
    {
        id: 'analytics-intro',
        title: "Data-Driven Decisions",
        text: "The Analytics page is where you transform your sales data into actionable business intelligence. It's designed to give you a clear and comprehensive overview of your store's performance.",
        attachTo: { element: '#analytics-header', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'analytics-charts',
        title: "Deep Performance Insights",
        text: "Review visual breakdowns for sales by token (including USD for card payments), sales over time, and your most profitable items. Because we track costs for each product variant, your profit margin calculations are always precise.",
        attachTo: { element: '.space-y-6 > .grid', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Finish Tour', action: tour.complete }
        ]
    }
];
