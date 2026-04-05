<template>
  <nav
    class="show-nav"
    :class="[`show-nav--${resolved.variant}`, viewMode === 'mobile' && 'show-nav--previewMobile']"
    aria-label="Primary"
  >
    <div class="show-nav__inner">
      <div class="show-nav__brand">
        <span class="show-nav__wordmark">{{ resolved.brandLabel }}</span>
        <span v-if="resolved.tagline" class="show-nav__tagline">{{ resolved.tagline }}</span>
      </div>

      <ul class="show-nav__links" role="list">
        <li v-for="(link, i) in resolved.links" :key="i" role="none">
          <button type="button" class="show-nav__link">
            {{ link.label }}
          </button>
        </li>
      </ul>

      <button type="button" class="show-nav__menuHint" tabindex="-1" aria-hidden="true">
        Menu
      </button>

      <div class="show-nav__actions">
        <button
          v-if="resolved.phone"
          type="button"
          class="show-nav__phone"
        >
          {{ resolved.phone }}
        </button>
        <button
          v-if="resolved.cta"
          type="button"
          class="show-nav__cta"
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
