import { writable } from 'svelte/store';

export const toast = writable(null);

export const showToast = (message, type = 'info') => {
  toast.set({ message, type });
};
