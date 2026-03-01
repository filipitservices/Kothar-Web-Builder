<template>
  <div class="cta-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="cta-text">
      <div 
        class="title editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateTitle"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ title }}
      </div>
      <div 
        class="subtitle editable"
        :class="{ 'has-local-value': isLocalValue('subtitle') }"
        @blur="updateSubtitle"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ subtitle }}
      </div>
    </div>
    <button class="btn primary">
      <span
        class="editable"
        :class="{ 'has-local-value': isLocalValue('buttonText') }"
        @blur="updateButtonText"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ buttonText }}
      </span>
    </button>
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

const { getField, setField, isLocalValue } = useBlockData(props.blockId, props.screenType);

const title = computed(() => getField('title') ?? 'Ready to start?');
const subtitle = computed(() => getField('subtitle') ?? 'A single call to action with a short reassurance line.');
const buttonText = computed(() => getField('buttonText') ?? 'Call to action');

const handleEnter = blurOnEnter;

const updateField = (fieldKey: string, e: FocusEvent) => {
  const newValue = extractContentEditableText(e);
  setField(fieldKey, newValue);
};

const updateTitle = (e: FocusEvent) => updateField('title', e);
const updateSubtitle = (e: FocusEvent) => updateField('subtitle', e);
const updateButtonText = (e: FocusEvent) => updateField('buttonText', e);
</script>

<style scoped>
.cta-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #f8fafc;
}

.cta-block .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  border-bottom: 2px solid #e2e8f0;
}

.cta-block .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
}

.btn {
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  padding: 6px 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  color: #334155;
  background: #f8fafc;
}

.btn.primary {
  background: #f8fafc;
  color: #334155;
}

.cta-block.mobile-layout {
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
}

.cta-block.mobile-layout .title {
  font-size: 14px;
}

.cta-block.mobile-layout .subtitle {
  font-size: 11px;
}

.cta-block.mobile-layout .btn {
  align-self: stretch;
  padding: 6px 10px;
  font-size: 11px;
}
</style>
