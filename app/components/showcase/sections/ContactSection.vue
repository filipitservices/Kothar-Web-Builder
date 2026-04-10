<template>
  <section class="show-sect show-sect--contact">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="contact__grid">
        <div class="contact__info">
          <div v-if="data.address" class="contact__item">
            <div class="contact__icon-wrap">
              <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="contact__text">{{ data.address }}</span>
          </div>
          <div v-if="data.phone" class="contact__item">
            <div class="contact__icon-wrap">
              <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </div>
            <span class="contact__text contact__text--strong">{{ data.phone }}</span>
          </div>
          <div v-if="data.email" class="contact__item">
            <div class="contact__icon-wrap">
              <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </div>
            <span class="contact__text">{{ data.email }}</span>
          </div>
          <div v-if="data.hours" class="contact__item">
            <div class="contact__icon-wrap">
              <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="contact__text contact__text--hours">{{ data.hours }}</span>
          </div>
        </div>

        <!-- Decorative map placeholder -->
        <div class="contact__map">
          <div class="contact__map-grid" aria-hidden="true"></div>
          <div class="contact__map-pin">
            <div class="contact__map-pin-dot"></div>
            <div class="contact__map-pin-line"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ContactData {
  title?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
}

defineProps<{
  data: ContactData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.show-sect--contact {
  background: var(--showcase-bg);
}

.contact__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  align-items: start;
}

.contact__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.contact__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.contact__icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--showcase-primary) 10%, var(--showcase-bg));
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 18%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact__icon {
  width: 14px;
  height: 14px;
  color: var(--showcase-primary);
}

.contact__text {
  font-size: 0.8em;
  color: color-mix(in srgb, var(--showcase-text) 82%, var(--showcase-bg));
  line-height: 1.5;
  padding-top: 6px;
}

.contact__text--strong {
  font-weight: 700;
  color: var(--showcase-text);
}

.contact__text--hours {
  font-size: 0.72em;
}

/* Map placeholder */
.contact__map {
  position: relative;
  height: 140px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: color-mix(in srgb, var(--showcase-primary) 8%, var(--showcase-bg));
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 14%, transparent);
}

/* Crosshatch grid pattern */
.contact__map-grid {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      color-mix(in srgb, var(--showcase-primary) 8%, transparent) 0,
      color-mix(in srgb, var(--showcase-primary) 8%, transparent) 1px,
      transparent 1px,
      transparent 18px
    ),
    repeating-linear-gradient(
      90deg,
      color-mix(in srgb, var(--showcase-primary) 8%, transparent) 0,
      color-mix(in srgb, var(--showcase-primary) 8%, transparent) 1px,
      transparent 1px,
      transparent 18px
    );
}

/* Pin indicator */
.contact__map-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact__map-pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--showcase-primary);
  border: 2.5px solid var(--showcase-bg);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--showcase-primary) 40%, transparent);
}

.contact__map-pin-line {
  width: 2px;
  height: 10px;
  background: color-mix(in srgb, var(--showcase-primary) 45%, transparent);
  margin-top: 1px;
}
</style>
