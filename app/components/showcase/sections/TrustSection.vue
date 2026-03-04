<template>
  <section class="show-sect show-sect--trust">
    <div class="show-sect__inner">
      <div class="trust__badges">
        <span v-for="badge in data.badges" :key="badge" class="trust__badge">
          <svg viewBox="0 0 20 20" fill="currentColor" class="show-icon show-icon--sm">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          {{ badge }}
        </span>
      </div>
      <div v-if="data.certifications" class="trust__certifications">
        <span v-for="cert in data.certifications" :key="cert" class="trust__cert">{{ cert }}</span>
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
  background: #f9fafb;
  padding: 20px 16px;
}

.trust__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.trust__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8em;
  font-weight: 600;
  color: var(--showcase-primary);
}

.trust__certifications {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.trust__cert {
  font-size: 0.75em;
  color: #6b7280;
}
</style>
