<template>
  <div class="showcase-renderer" :class="[`view-${viewMode}`]" :style="colorVars">
    <component
      v-for="(section, index) in template.sections"
      :key="index"
      :is="getSectionComponent(section.type)"
      :data="section.data"
      :view-mode="viewMode"
    />
    <footer class="showcase-footer">
      <p>&copy; {{ currentYear }} {{ template.name }}. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';

// Section components
import HeroSection from './sections/HeroSection.vue';
import TrustSection from './sections/TrustSection.vue';
import ServicesSection from './sections/ServicesSection.vue';
import ProcessSection from './sections/ProcessSection.vue';
import TestimonialsSection from './sections/TestimonialsSection.vue';
import StatsSection from './sections/StatsSection.vue';
import TeamSection from './sections/TeamSection.vue';
import GallerySection from './sections/GallerySection.vue';
import PricingSection from './sections/PricingSection.vue';
import CtaSection from './sections/CtaSection.vue';
import AboutSection from './sections/AboutSection.vue';
import FeaturesSection from './sections/FeaturesSection.vue';
import ContactSection from './sections/ContactSection.vue';
import FaqSection from './sections/FaqSection.vue';

interface ShowcaseRendererProps {
  template: ShowcaseTemplate;
  viewMode: 'desktop' | 'mobile';
}

const props = defineProps<ShowcaseRendererProps>();

// Section type to component mapping
const sectionComponents: Record<string, Component> = {
  hero: HeroSection,
  trust: TrustSection,
  services: ServicesSection,
  process: ProcessSection,
  testimonials: TestimonialsSection,
  stats: StatsSection,
  team: TeamSection,
  gallery: GallerySection,
  pricing: PricingSection,
  cta: CtaSection,
  about: AboutSection,
  features: FeaturesSection,
  contact: ContactSection,
  location: ContactSection, // Alias - uses same component
  faq: FaqSection,
};

const getSectionComponent = (type: string): Component | null => {
  return sectionComponents[type] || null;
};

const currentYear = new Date().getFullYear();

const colorVars = computed(() => ({
  '--showcase-primary': props.template.colorScheme.primary,
  '--showcase-secondary': props.template.colorScheme.secondary,
  '--showcase-accent': props.template.colorScheme.accent,
  '--showcase-bg': props.template.colorScheme.background,
  '--showcase-text': props.template.colorScheme.text,
}));
</script>

<style src="~/assets/css/showcase.css"></style>
