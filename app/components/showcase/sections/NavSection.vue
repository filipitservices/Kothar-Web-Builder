<template>
  <nav
    class="sn"
    :class="[`sn-${resolved.variant}`, viewMode === 'mobile' && 'sn-tight']"
    aria-label="Primary"
  >
    <div class="sn-in">
      <div class="sn-brand">
        <span class="sn-mark">{{ resolved.brandLabel }}</span>
        <span v-if="resolved.tagline" class="sn-tag">{{ resolved.tagline }}</span>
      </div>

      <ul class="sn-links" role="list">
        <li v-for="(link, i) in resolved.links" :key="i" role="none">
          <button type="button" class="sn-item">
            {{ link.label }}
          </button>
        </li>
      </ul>

      <button type="button" class="sn-menu" tabindex="-1" aria-hidden="true">
        Menu
      </button>

      <div class="sn-act">
        <button
          v-if="resolved.phone"
          type="button"
          class="sn-tel"
        >
          {{ resolved.phone }}
        </button>
        <button
          v-if="resolved.cta"
          type="button"
          class="sn-go"
        >
          {{ resolved.cta.label }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isNavSectionData, type NavSectionData } from '~/stores/showcase';

const props = defineProps<{
  data: Record<string, unknown>;
  /** Drives compact preview layout inside the gallery modal device frame. */
  viewMode: 'desktop' | 'mobile';
}>();

const fallbackNav: NavSectionData = {
  variant: 'tradeQuote',
  brandLabel: 'Business',
  links: [{ label: 'Home' }, { label: 'Contact' }]
};

const resolved = computed((): NavSectionData => {
  if (isNavSectionData(props.data)) {
    return props.data;
  }
  return fallbackNav;
});
</script>
