<template>
  <div class="testimonial-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="testimonial-quote">★★★★★</div>
    <div 
      class="testimonial-text editable"
      :class="{ 'has-local-value': isLocalValue('testimonial') }"
      @blur="updateTestimonial"
      @keydown.enter.prevent="handleEnter"
      contenteditable="true"
    >
      {{ testimonial }}
    </div>
    <div class="testimonial-author">
      — 
      <span class="editable">
        {{ clientName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

const props = defineProps({
  blockId: {
    type: String,
    required: true
  },
  screenType: {
    type: String,
    default: 'desktop'
  }
});

const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);

const testimonial = computed(() => getField('testimonial') ?? '"Customer quote goes here. Share a specific benefit or result."');
const clientName = computed(() => mergedData.value.companyName || 'Client Name, Company');

const handleEnter = blurOnEnter;

const updateField = (fieldKey: string, e: FocusEvent) => {
  const newValue = extractContentEditableText(e);
  setField(fieldKey, newValue);
};

const updateTestimonial = (e: FocusEvent) => updateField('testimonial', e);
</script>

<style scoped>
.testimonial-block {
  padding: 14px;
  background: #f8fafc;
  border-left: 4px solid #1e3a8a;
  text-align: center;
}

.testimonial-quote {
  font-size: 14px;
  color: #fbbf24;
  margin-bottom: 8px;
}

.testimonial-text {
  font-size: 12px;
  color: #334155;
  font-style: italic;
  margin-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 8px;
}

.testimonial-author {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.testimonial-block.mobile-layout {
  padding: 10px;
}

.testimonial-block.mobile-layout .testimonial-text {
  font-size: 11px;
}

.testimonial-block.mobile-layout .testimonial-author {
  font-size: 10px;
}
</style>
