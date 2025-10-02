import { writable } from 'svelte/store';

// This store will hold the single, global instance of the tour
export const tour = writable(null);
