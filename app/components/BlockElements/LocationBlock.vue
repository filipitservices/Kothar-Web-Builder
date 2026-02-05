<template>
  <div class="location-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="location-header">
      <div 
        class="title editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateField('title', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ title }}
      </div>
    </div>

    <div class="location-content">
      <div class="location-info">
        <div class="info-section">
          <div class="info-label">Address</div>
          <div class="info-value">{{ mergedData.fullAddress || '123 Main Street, City, ST 12345' }}</div>
        </div>

        <div class="info-section">
          <div class="info-label">Phone</div>
          <div class="info-value">{{ mergedData.telephone || '(555) 123-4567' }}</div>
        </div>

        <div class="info-section">
          <div class="info-label">Email</div>
          <div class="info-value">{{ mergedData.email || 'contact@business.com' }}</div>
        </div>

        <div class="info-section">
          <div class="info-label">Hours</div>
          <div class="info-value">{{ mergedData.businessHours || 'Mon-Fri: 9AM-5PM' }}</div>
        </div>
      </div>

      <div class="location-map">
        <div class="map-placeholder">
          <span class="map-icon">📍</span>
          <span class="map-text">Map View</span>
        </div>
      </div>
    </div>

    <div 
      class="location-note editable"
      :class="{ 'has-local-value': isLocalValue('note') }"
      @blur="updateField('note', $event)"
      @keydown.enter.prevent="blurOnEnter"
      contenteditable="true"
    >
      {{ note }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? 'Visit Us');
const note = computed(() => getField('note') ?? 'We look forward to serving you. Call ahead for appointments.');

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.location-block {
  padding: 14px;
  background: #f8fafc;
}

.location-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.location-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 10px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-section {
  padding: 8px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
}

.info-label {
  font-size: 10px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.info-value {
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
}

.location-map {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.map-icon {
  font-size: 32px;
}

.map-text {
  font-size: 11px;
  font-weight: 600;
}

.location-note {
  font-size: 11px;
  color: #64748b;
  padding: 8px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  text-align: center;
  font-style: italic;
}

.location-block.mobile-layout {
  padding: 10px;
}

.location-block.mobile-layout .location-header .title {
  font-size: 14px;
}

.location-block.mobile-layout .location-content {
  grid-template-columns: 1fr;
  gap: 10px;
}

.location-block.mobile-layout .location-map {
  min-height: 120px;
}
</style>
