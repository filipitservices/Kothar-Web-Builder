export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('draggable', defineAsyncComponent(() => import('vuedraggable')))
})
