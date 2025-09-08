import { writable, get } from 'svelte/store';
import { mints } from './stores.js';

export const tokenPrices = writable({});
export const tokenCharts = writable({}); // Caches chart data: { solana: { '7': [...] } }

export async function fetchPrices() {
    const allMints = get(mints);
    const coingeckoIds = [...new Set(allMints.filter(m => m.name !== 'USDC').map(m => m.coingeckoId))].join(',');

    if (!coingeckoIds) return;

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`);
        if (!response.ok) {
            throw new Error('Failed to fetch prices from CoinGecko');
        }
        const data = await response.json();
        
        data['usd-coin'] = { usd: 1 };

        tokenPrices.set(data);
    } catch (error) {
        console.error("Error fetching token prices:", error);
        tokenPrices.set({ 'usd-coin': { usd: 1 } });
    }
}

// Fetches and returns historical data for a specific coin and timeframe, using the cache if available.
export async function getChartDataForCoin(coingeckoId, days = 7) {
    const currentCharts = get(tokenCharts);

    // Return cached data if it exists
    if (currentCharts[coingeckoId] && currentCharts[coingeckoId][days]) {
        return Promise.resolve(currentCharts[coingeckoId][days]);
    }

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chart data for ${coingeckoId}`);
        }
        const data = await response.json();
        const prices = data.prices || []; // Ensure prices is always an array
        
        // Update the cache in the store
        tokenCharts.update(charts => {
            if (!charts[coingeckoId]) charts[coingeckoId] = {};
            charts[coingeckoId][days] = prices;
            return charts;
        });
        
        return prices;

    } catch (error) {
        console.error(error);
        // In case of an error, update the cache with an empty array to prevent re-fetching a failing request
        tokenCharts.update(charts => {
            if (!charts[coingeckoId]) charts[coingeckoId] = {};
            charts[coingeckoId][days] = [];
            return charts;
        });
        return []; // Return empty array on error
    }
}
