<template>
  <div class="header-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
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

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? 'Section headline');
const subtitle = computed(() => getField('subtitle') ?? 'Concise lead-in text for this section.');

const handleEnter = blurOnEnter;

const updateField = (fieldKey: string, e: FocusEvent) => {
  const newValue = extractContentEditableText(e);
  setField(fieldKey, newValue);
};

const updateTitle = (e: FocusEvent) => updateField('title', e);
const updateSubtitle = (e: FocusEvent) => updateField('subtitle', e);
</script>

<style scoped>
.header-block {
  padding: 12px;
  background: #f8fafc;
}

.header-block .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  border-bottom: 2px solid #e2e8f0;
}

.header-block .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
}

.header-block.mobile-layout {
  padding: 8px;
}

.header-block.mobile-layout .title {
  font-size: 14px;
}

.header-block.mobile-layout .subtitle {
  font-size: 11px;
}
</style>
