/**
 * Vue Drawing Canvas Plugin
 * Registers vue-drawing-canvas globally for use in Nuxt 4
 * Follows Nuxt 4 best practices for plugin structure
 */

import VueDrawingCanvas from 'vue-drawing-canvas';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueDrawingCanvas', VueDrawingCanvas);
});
