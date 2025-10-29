import { inventoryHistory } from '../routes/stores.js';

/**
 * Adds an entry to an item's history log.
 * @param {string} itemId - The ID of the inventory item.
 * @param {string} reason - The reason for the change (e.g., 'Sale', 'Item Created').
 * @param {string} change - The change in quantity (e.g., '-1', '+50').
 * @param {number} newQty - The new total quantity after the change.
 */
export function logHistory(itemId, reason, change, newQty) {
    inventoryHistory.update(history => {
        if (!history[itemId]) {
            history[itemId] = [];
        }
        history[itemId].unshift({ date: new Date().toISOString(), reason, change, newQty });
        // Keep only the last 50 entries for performance
        history[itemId] = history[itemId].slice(0, 50);
        return history;
    });
}
