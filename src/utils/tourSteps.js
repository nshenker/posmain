import { goto } from '$app/navigation';

const switchTab = (page, tabIndex) => {
    let selector;
    if (page === 'pos') {
        // POS tabs are 1-indexed for nth-child
        selector = `#pos-tabs button:nth-child(${tabIndex})`;
    } else if (page === 'inventory') {
        selector = `#inventory-tabs button:nth-child(${tabIndex})`;
    } else if (page === 'settings') {
        selector = `#settings-tabs button:nth-child(${tabIndex})`;
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
        text: "This is your command center. The Key Metrics widget gives you a real-time summary of your store's performance. All revenue figures are automatically converted to their current USD value using live price feeds.",
        attachTo: { element: '#key-metrics-widget', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'dashboard-widgets',
        title: "A Personalized Command Center",
        text: "The dashboard is made of modular widgets like sales charts and low stock alerts. You can use the 'Edit Widgets' button to customize your layout and prioritize the data that's most important to you.",
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
        text: "This is the heart of your daily operations. We've organized it into tabs for 'Charge', 'Transactions', and manager-only 'Settings'.",
        attachTo: { element: '#pos-tabs', on: 'bottom' },
        buttons: [
            { text: 'Back', action: () => goto('/dashboard'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-create-charge',
        title: "Accepting Payments",
        text: "Here, you can build a customer's cart by adding items, scanning barcodes, or using the keypad. You can also attach a customer to the sale, which links the transaction to their CRM profile.",
        attachTo: { element: '#pos-input-section', on: 'left' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Transactions', action: tour.next }
        ]
    },
    {
        id: 'pos-transactions-list',
        title: "Your Complete Sales History",
        text: "This is your digital ledger. Every sale, whether crypto or card, is recorded here. You can expand each transaction to see the specific items purchased.",
        attachTo: { element: '#transactions-card', on: 'top' },
        when: {
            show: () => switchTab('pos', 2)
        },
        buttons: [
            { text: 'Back', action: () => { switchTab('pos', 1); tour.back(); }, secondary: true },
            { text: 'Next: Settings', action: tour.next }
        ]
    },
    {
        id: 'pos-settings-intro',
        title: "Store & Employee Management",
        text: "The settings area is restricted to managers. Here you can configure everything from your store's appearance and payment options to your employee roster.",
        attachTo: { element: '#settings-view', on: 'top' },
        when: {
            show: () => switchTab('pos', 3)
        },
        buttons: [
            { text: 'Back', action: () => { switchTab('pos', 2); tour.back(); }, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'pos-settings-employees',
        title: "Managing Your Team",
        text: "In the 'Employees' tab, you can create new user accounts, assign roles (Manager or Employee), and manage their secure PINs. This ensures your team has the access they need, and nothing more.",
        attachTo: { element: '#settings-view', on: 'top' },
        when: {
            show: () => switchTab('settings', 2)
        },
        buttons: [
            { text: 'Back', action: () => { switchTab('settings', 1); tour.back(); }, secondary: true },
            { text: 'Next: Time Clock', action: () => goto('/timeclock') }
        ]
    },

    // --- Time Clock ---
    {
        id: 'timeclock-intro',
        title: "Employee Time Clock",
        text: "This is the central hub for your team to manage their shifts. It's designed to be quick, easy, and accessible from any device.",
        attachTo: { element: '#timeclock-header', on: 'bottom' },
        buttons: [
            { text: 'Back', action: () => goto('/pos'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'timeclock-select',
        title: "Simple & Secure Access",
        text: "Employees simply select their name from the grid to get started. This brings them to a secure PIN entry screen.",
        attachTo: { element: '#employee-selection-grid', on: 'bottom' },
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next: Invoicing', action: () => goto('/invoicing') }
        ]
    },

    // --- Invoicing ---
    {
        id: 'invoicing-intro',
        title: "Professional Invoicing",
        text: "Create, manage, and track professional invoices for your clients. You can pull customers directly from your CRM, add items from your inventory, and see a live preview as you build it.",
        attachTo: { element: '#invoice-details-card', on: 'right' },
        buttons: [
            { text: 'Back', action: () => goto('/timeclock'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'invoicing-table',
        title: "Automated Payment Tracking",
        text: "Your saved invoices are listed here. The system automatically monitors the Solana network for payments and updates an invoice's status from 'Unpaid' to 'Paid' the moment a client pays.",
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
        id: 'inventory-management',
        title: "Detailed Stock Control",
        text: "The main inventory list gives you a clear overview of all your products. For variable items, you can expand the entry to see and manage the stock for each individual variant. Every stock change is automatically logged.",
        attachTo: { element: '#inventory-table-container', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-categories',
        title: "Organize with Categories",
        text: "Use categories to keep your inventory organized. You can create new categories and assign items to them, which also helps in filtering and reporting.",
        attachTo: { element: '#inventory-tabs', on: 'bottom' },
        when: {
            show: () => switchTab('inventory', 2)
        },
        buttons: [
            { text: 'Back', action: () => { switchTab('inventory', 1); tour.back(); }, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-locations',
        title: "Track Physical Locations",
        text: "Manage the physical locations of your items, like shelves, bins, or different rooms. This helps you and your staff find products quickly.",
        attachTo: { element: '#inventory-tabs', on: 'bottom' },
        when: {
            show: () => switchTab('inventory', 3)
        },
        buttons: [
            { text: 'Back', action: () => { switchTab('inventory', 2); tour.back(); }, secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'inventory-reports',
        title: "Inventory Reports",
        text: "Get valuable insights into your stock with reports like Inventory Valuation, Sales Velocity, and Dead Stock.",
        attachTo: { element: '#inventory-tabs', on: 'bottom' },
        when: {
            show: () => switchTab('inventory', 4)
        },
        buttons: [
            { text: 'Back', action: () => { switchTab('inventory', 3); tour.back(); }, secondary: true },
            { text: 'Next: CRM', action: () => goto('/crm') }
        ]
    },
    
    // --- CRM ---
    {
        id: 'crm-intro',
        title: "Customer Relationship Management (CRM)",
        text: "The CRM is your central hub for building strong customer relationships. It automatically tracks each customer's total spending and full purchase history, including items bought at the POS.",
        attachTo: { element: '#crm-table', on: 'top' },
        buttons: [
            { text: 'Back', action: () => goto('/inventory'), secondary: true },
            { text: 'Next', action: tour.next }
        ]
    },
    {
        id: 'crm-actions',
        title: "Segmentation and Data Tools",
        text: "Use this panel to filter your customer list by tags or custom groups. You can also manage your entire database by importing or exporting your customer data via CSV at any time.",
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
        text: "Review visual breakdowns for sales by token, sales over time, and your most profitable items. Because we track costs for each product, your profit margin calculations are always precise.",
        attachTo: { element: '#analytics-charts-grid', on: 'top' }, 
        buttons: [
            { text: 'Back', action: tour.back, secondary: true },
            { text: 'Finish Tour', action: tour.complete }
        ]
    }
];
