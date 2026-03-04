<template>
  <section class="show-sect show-sect--contact">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="contact__grid">
        <div class="contact__info">
          <p v-if="data.address" class="contact__item">
            <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            {{ data.address }}
          </p>
          <p v-if="data.phone" class="contact__item">
            <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            {{ data.phone }}
          </p>
          <p v-if="data.email" class="contact__item">
            <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            {{ data.email }}
          </p>
          <p v-if="data.hours" class="contact__item">
            <svg viewBox="0 0 20 20" fill="currentColor" class="contact__icon">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            {{ data.hours }}
          </p>
        </div>
        <div class="contact__map show-ph"></div>
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
.contact__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.contact__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85em;
  margin: 0;
}

.contact__icon {
  width: 16px;
  height: 16px;
  color: var(--showcase-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.contact__map {
  height: 120px;
}
</style>
