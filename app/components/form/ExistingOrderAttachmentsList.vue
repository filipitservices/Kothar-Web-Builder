<template>
  <div
    v-if="attachments.length"
    class="form-group existing-attachments"
    :class="{
      'existing-attachments--logo': variant === 'logo',
      'existing-attachments--brand': variant === 'brand'
    }"
  >
    <label class="form-label">{{ label }}</label>
    <ul class="existing-attachments-list" :aria-label="listAriaLabel">
      <li
        v-for="(att, index) in attachments"
        :key="`${att.originalName}-${att.storagePath}-${index}`"
        class="existing-attachments-item"
      >
        <span class="existing-attachments-name">{{ att.originalName }}</span>
        <span class="existing-attachments-size">{{ formatOrderAttachmentSize(att.size) }}</span>
        <a
          v-if="att.downloadURL"
          :href="att.downloadURL"
          target="_blank"
          rel="noopener noreferrer"
          class="existing-attachments-link"
        >
          Download
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { OrderAttachment } from '~/types/order';
import { formatOrderAttachmentSize } from '~/utils/orderAttachmentDisplay';

withDefaults(
  defineProps<{
    attachments: readonly OrderAttachment[];
    label: string;
    listAriaLabel: string;
    /** Matches request form subsection tint (logo vs branding material). */
    variant?: 'logo' | 'brand';
  }>(),
  { variant: 'brand' }
);
</script>

<style scoped>
.existing-attachments {
  margin-bottom: var(--space-md);
}

.existing-attachments-list {
  list-style: none;
  margin: 0;
  padding: var(--space-sm) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.existing-attachments-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.existing-attachments--logo .existing-attachments-item {
  background: color-mix(in srgb, var(--color-primary-tint) 55%, var(--color-bg));
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
}

.existing-attachments--brand .existing-attachments-item {
  background: color-mix(in srgb, var(--color-accent-warm-tint) 45%, var(--color-bg));
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 14%, var(--color-border));
}

.existing-attachments-name {
  flex: 1;
  min-width: 0;
  color: var(--color-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.existing-attachments-size {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.existing-attachments-link {
  flex-shrink: 0;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.existing-attachments-link:hover {
  text-decoration: underline;
}

.existing-attachments--brand .existing-attachments-link {
  color: color-mix(in srgb, var(--color-accent-warm-deep) 45%, var(--color-primary));
}
</style>
