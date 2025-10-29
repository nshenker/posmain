import { writable } from 'svelte/store';

function createFullscreenStore() {
    const { subscribe, set } = writable(false);

    function isFullscreen() {
        return document.fullscreenElement != null;
    }

    async function enter() {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
    }

    async function exit() {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    }

    async function toggle() {
        isFullscreen() ? await exit() : await enter();
    }

    return {
        subscribe,
        toggle,
        set
    };
}

export const fullscreen = createFullscreenStore();
