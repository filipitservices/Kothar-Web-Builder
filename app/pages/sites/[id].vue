<template>
  <div v-if="site" class="site-page">
    <main class="site-main">
      <div class="site-content">
        <NuxtLink to="/sites" class="site-back">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
          Back to your sites
        </NuxtLink>

        <header class="site-header">
          <h1 class="site-title">{{ site.businessName }}</h1>
          <p class="site-subtitle">Manage your site content and settings. Changes here update what visitors see.</p>
        </header>

        <!-- Hero content -->
        <section class="site-sect">
          <h2 class="site-sect__title">Main headline & message</h2>
          <p class="site-sect__hint">The first thing visitors see. Keep it clear and welcoming.</p>
          <div class="form-group">
            <label for="hero-headline" class="form-label">Headline</label>
            <input
              id="hero-headline"
              :value="site.hero.headline"
              type="text"
              class="form-input"
              @input="updateHero('headline', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="form-group">
            <label for="hero-subline" class="form-label">Supporting line</label>
            <input
              id="hero-subline"
              :value="site.hero.subline"
              type="text"
              class="form-input"
              @input="updateHero('subline', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="form-group">
            <label for="hero-cta" class="form-label">Button text</label>
            <input
              id="hero-cta"
              :value="site.hero.ctaText"
              type="text"
              class="form-input"
              placeholder="e.g. Get in touch"
              @input="updateHero('ctaText', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </section>

        <!-- Business hours -->
        <section class="site-sect">
          <h2 class="site-sect__title">Business hours</h2>
          <p class="site-sect__hint">When you're open. Visitors see this on your contact section.</p>
          <div class="site-hours-list">
            <div
              v-for="(entry, index) in localHours"
              :key="index"
              class="site-hours-row"
            >
              <input
                v-model="entry.days"
                type="text"
                class="form-input site-hours-days"
                placeholder="e.g. Mon – Fri"
              />
              <input
                v-model="entry.hours"
                type="text"
                class="form-input site-hours-time"
                placeholder="e.g. 9am – 5pm"
              />
            </div>
          </div>
          <button type="button" class="btn btn--secondary btn--sm" @click="saveHours">
            Save hours
          </button>
        </section>

        <!-- Seasonal announcement -->
        <section class="site-sect">
          <h2 class="site-sect__title">Seasonal or promotional message</h2>
          <p class="site-sect__hint">A banner visitors see at the top. Turn it on when you have a special offer or notice.</p>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="site.seasonalAnnouncement.enabled"
                @change="updateAnnouncement({ enabled: ($event.target as HTMLInputElement).checked })"
              />
              <span>Show announcement banner</span>
            </label>
          </div>
          <div v-if="site.seasonalAnnouncement.enabled" class="form-group">
            <label for="announcement-text" class="form-label">Message</label>
            <input
              id="announcement-text"
              :value="site.seasonalAnnouncement.text"
              type="text"
              class="form-input"
              placeholder="e.g. Holiday hours: closed Dec 24–26"
              @input="updateAnnouncement({ text: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </section>

        <!-- Hero image -->
        <section class="site-sect">
          <h2 class="site-sect__title">Hero image</h2>
          <p class="site-sect__hint">The main image on your homepage. Upload a new one when you're ready.</p>
          <div class="site-image-placeholder">
            <p class="site-image-placeholder-text">Image upload will be available when we connect your account. For now, your site uses the default layout.</p>
          </div>
        </section>

        <!-- Preview strip -->
        <section class="site-sect site-preview-strip">
          <h2 class="site-sect__title">Quick preview</h2>
          <p class="site-sect__hint">How your headline and announcement look to visitors.</p>
          <div class="site-preview-mock">
            <div v-if="site.seasonalAnnouncement.enabled && site.seasonalAnnouncement.text" class="site-preview-announcement">
              {{ site.seasonalAnnouncement.text }}
            </div>
            <div class="site-preview-hero">
              <h3 class="site-preview-hero-title">{{ site.hero.headline || 'Your headline' }}</h3>
              <p class="site-preview-hero-sub">{{ site.hero.subline || 'Supporting message' }}</p>
              <span class="site-preview-hero-cta">{{ site.hero.ctaText || 'Button' }}</span>
            </div>
          </div>
        </section>

        <!-- Request change -->
        <section class="site-sect">
          <h2 class="site-sect__title">Need a bigger change?</h2>
          <p class="site-sect__hint">We can update structure, add new sections, or redesign. Submit a request and our team will get back to you.</p>
          <div class="site-actions">
            <button type="button" class="site-cta" @click="requestChange">
              Request a change from our team
            </button>
          </div>
        </section>
      </div>
    </main>

    <footer class="sites-footer">
      <div class="footer-inner">
        <p class="footer-text">&copy; {{ new Date().getFullYear() }} {{ appConfig.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>

  <div v-else class="site-page">
    <main class="site-main">
      <div class="site-content">
        <p class="sites-empty">This site wasn't found.</p>
        <NuxtLink to="/sites" class="site-back">Back to your sites</NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { BusinessHoursEntry } from '~/stores/sites';

definePageMeta({
  middleware: 'auth',
});

defineOptions({ name: 'SiteDetailPage' });

const route = useRoute();
const sitesStore = useSitesStore();
const appConfig = useAppConfig();

const siteId = computed(() => route.params.id as string);
const site = computed(() => sitesStore.getSiteById(siteId.value));

const localHours = ref<BusinessHoursEntry[]>([]);

watch(
  site,
  (s) => {
    if (s) localHours.value = s.businessHours.map((h) => ({ ...h }));
  },
  { immediate: true }
);

function updateHero(field: 'headline' | 'subline' | 'ctaText', value: string) {
  if (!site.value) return;
  sitesStore.updateSiteHero(site.value.id, { [field]: value });
}

function updateAnnouncement(updates: { enabled?: boolean; text?: string }) {
  if (!site.value) return;
  sitesStore.updateSiteSeasonalAnnouncement(site.value.id, updates);
}

function saveHours() {
  if (!site.value) return;
  sitesStore.updateSiteBusinessHours(site.value.id, localHours.value);
}

function requestChange() {
  // No backend — could set a local "pending request" state or toast. For now just a no-op.
  alert('Request received. Our team will follow up — this is a demo, so no request is actually sent.');
}
</script>

<style scoped src="~/assets/css/sites.css"></style>
