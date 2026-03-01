<template>
  <div class="footer-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="footer-content">
      <div class="footer-brand-section">
        <div class="footer-brand">
          {{ brandText }}
        </div>
        <div 
          class="footer-tagline editable"
          :class="{ 'has-local-value': isLocalValue('tagline') }"
          @blur="updateField('tagline', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ tagline }}
        </div>
      </div>
      
      <div class="footer-contact-section">
        <div class="footer-contact-label">Contact Us</div>
        <div class="footer-contact-info">
          <div class="footer-info">{{ mergedData.email || 'info@yourcompany.com' }}</div>
          <div class="footer-info">{{ mergedData.telephone || '(555) 123-4567' }}</div>
          <div class="footer-info">{{ mergedData.fullAddress || '123 Main Street, City, ST 12345' }}</div>
          <div class="footer-info">{{ mergedData.businessHours || 'Mon-Fri: 9AM-5PM' }}</div>
        </div>
      </div>
    </div>
    
    <div class="footer-copyright">
      © {{ currentYear }} {{ brandText }}. All rights reserved.
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

const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId, props.screenType);

const currentYear = new Date().getFullYear();

const brandText = computed(() => 
  mergedData.value.companyName || 'Your Company'
);

const tagline = computed(() => 
  getField('tagline') || 'Quality service you can trust.'
);

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.footer-block {
  padding: 16px;
  background: #f8fafc;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto 16px;
  padding-bottom: 16px;
}

.footer-brand-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-brand {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 2px;
}

.footer-tagline {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.footer-contact-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-contact-label {
  font-weight: 700;
  font-size: 11px;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-info {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
}

.footer-copyright {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  padding: 8px;
}

.footer-block.mobile-layout {
  padding: 12px;
}

.footer-block.mobile-layout .footer-content {
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
}

.footer-block.mobile-layout .footer-brand {
  font-size: 14px;
}

.footer-block.mobile-layout .footer-tagline {
  font-size: 11px;
}

.footer-block.mobile-layout .footer-contact-label {
  font-size: 10px;
}

.footer-block.mobile-layout .footer-info {
  font-size: 10px;
}

.footer-block.mobile-layout .footer-copyright {
  font-size: 10px;
}
</style>
