<template>
  <section class="show-sect show-sect--trust">
    <div class="show-sect__inner">
      <div class="trust__badges">
        <span v-for="badge in data.badges" :key="badge" class="trust__badge">
          <svg viewBox="0 0 20 20" fill="currentColor" class="trust__badge-icon">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          {{ badge }}
        </span>
      </div>
      <div v-if="data.certifications?.length" class="trust__certs-wrap">
        <div class="trust__certs-rule"></div>
        <div class="trust__certifications">
          <span v-for="cert in data.certifications" :key="cert" class="trust__cert">{{ cert }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TrustData {
  badges: string[];
  certifications?: string[];
}

defineProps<{
  data: TrustData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.show-sect--trust {
  background: color-mix(in srgb, var(--showcase-primary) 6%, var(--showcase-bg));
  padding: var(--space-lg) var(--space-md);
}

.trust__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: center;
}

.trust__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 5px var(--space-md);
  background: var(--showcase-bg);
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 24%, transparent);
  border-radius: var(--radius-xl);
  font-size: 0.775em;
  font-weight: 600;
  color: var(--showcase-primary);
  white-space: nowrap;
}

.trust__badge-icon {
  width: 13px;
  height: 13px;
  color: var(--showcase-accent);
  flex-shrink: 0;
}

.trust__certs-wrap {
  margin-top: var(--space-md);
}

.trust__certs-rule {
  height: 1px;
  background: color-mix(in srgb, var(--showcase-primary) 14%, transparent);
  margin-bottom: var(--space-sm);
}

.trust__certifications {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.trust__cert {
  font-size: 0.72em;
  font-weight: 500;
  color: color-mix(in srgb, var(--showcase-text) 60%, var(--showcase-bg));
}
</style>
