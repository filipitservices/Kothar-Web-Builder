<script setup lang="ts">
/**
 * Section Icons
 *
 * SVG icons used in form section headers.
 * Each icon is a named slot that can be used with FormSection.
 */
</script>

<template>
  <!-- This component exports icon templates via slots -->
  <slot />
</template>

<!-- Export individual icon components -->
<script lang="ts">
import { defineComponent, h } from 'vue';

/**
 * Palette icon for design/customization sections
 */
export const PaletteIcon = defineComponent({
  name: 'PaletteIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.53-.21-1.01-.54-1.37-.33-.35-.54-.82-.54-1.33 0-1.1.9-2 2-2h2.36c3.1 0 5.62-2.52 5.62-5.62C22.96 5.82 18.16 2 12 2z' }),
      h('circle', { cx: '7.5', cy: '11.5', r: '1.5' }),
      h('circle', { cx: '10.5', cy: '7.5', r: '1.5' }),
      h('circle', { cx: '16.5', cy: '7.5', r: '1.5' }),
      h('circle', { cx: '17.5', cy: '11.5', r: '1.5' })
    ]);
  }
});

/**
 * Building icon for business information sections
 */
export const BuildingIcon = defineComponent({
  name: 'BuildingIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01' })
    ]);
  }
});

/**
 * Phone icon for contact information sections
 */
export const ContactIcon = defineComponent({
  name: 'ContactIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
    ]);
  }
});

/**
 * Target icon for goals sections
 */
export const TargetIcon = defineComponent({
  name: 'TargetIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('circle', { cx: '12', cy: '12', r: '6' }),
      h('circle', { cx: '12', cy: '12', r: '2' })
    ]);
  }
});

/**
 * Star icon for branding/content sections
 */
export const SparkleIcon = defineComponent({
  name: 'SparkleIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    ]);
  }
});

/**
 * User icon for contact name field
 */
export const UserIcon = defineComponent({
  name: 'UserIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '12', cy: '7', r: '4' })
    ]);
  }
});

/**
 * Email icon for email field
 */
export const EmailIcon = defineComponent({
  name: 'EmailIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      h('polyline', { points: '22,6 12,13 2,6' })
    ]);
  }
});

/**
 * Phone/mobile icon for phone field
 */
export const PhoneIcon = defineComponent({
  name: 'PhoneIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2', ry: '2' }),
      h('line', { x1: '12', y1: '18', x2: '12.01', y2: '18' })
    ]);
  }
});

/**
 * Globe icon for website field
 */
export const GlobeIcon = defineComponent({
  name: 'GlobeIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
      h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
    ]);
  }
});

/**
 * Map pin icon for address field
 */
export const MapPinIcon = defineComponent({
  name: 'MapPinIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
      h('circle', { cx: '12', cy: '10', r: '3' })
    ]);
  }
});

/**
 * Image icon for branding section
 */
export const BrandingIcon = defineComponent({
  name: 'BrandingIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
      h('polyline', { points: '21 15 16 10 5 21' })
    ]);
  }
});

/**
 * Briefcase icon for business info section
 */
export const BusinessIcon = defineComponent({
  name: 'BusinessIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('rect', { x: '2', y: '7', width: '20', height: '14', rx: '2', ry: '2' }),
      h('path', { d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' })
    ]);
  }
});

/**
 * Clipboard/list icon for additional requests section
 */
export const RequestsIcon = defineComponent({
  name: 'RequestsIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
      h('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }),
      h('line', { x1: '9', y1: '12', x2: '15', y2: '12' }),
      h('line', { x1: '9', y1: '16', x2: '15', y2: '16' })
    ]);
  }
});

/**
 * Link icon for preferred URL field
 */
export const LinkIcon = defineComponent({
  name: 'LinkIcon',
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
      h('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })
    ]);
  }
});
</script>
