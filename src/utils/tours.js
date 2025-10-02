import { get } from 'svelte/store';
import { tour } from './tourStore.js';

export function startTour() {
    const tourInstance = get(tour);
    if (tourInstance) {
        // If the tour is already running, cancel it completely before starting over
        if (tourInstance.isActive()) {
            tourInstance.cancel();
        }
        // A brief timeout ensures the old tour is fully torn down before starting a new one.
        setTimeout(() => {
            tourInstance.start();
        }, 50);
    }
}
