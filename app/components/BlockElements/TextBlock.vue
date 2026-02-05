<template>
  <div class="text-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div 
      class="text-title editable"
      :class="{ 'has-local-value': isLocalValue('title') }"
      @blur="updateTitle"
      @keydown.enter.prevent="handleEnter"
      contenteditable="true"
    >
      {{ title }}
    </div>
    <div 
      class="text-content editable"
      :class="{ 'has-local-value': isLocalValue('content') }"
      @blur="updateContent"
      @keydown.enter.prevent="handleEnter"
      contenteditable="true"
    >
      {{ content }}
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

const title = computed(() => getField('title') ?? 'Text Section Heading');
const content = computed(() => getField('content') ?? 'Add any paragraph or formatted text content here. This is useful for longer explanations, stories, or details.');

const handleEnter = blurOnEnter;

const updateField = (fieldKey: string, e: FocusEvent) => {
  const newValue = extractContentEditableText(e);
  setField(fieldKey, newValue);
};

const updateTitle = (e: FocusEvent) => updateField('title', e);
const updateContent = (e: FocusEvent) => updateField('content', e);
</script>

<style scoped>
.text-block {
  padding: 14px;
  background: #f8fafc;
}

.text-title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 6px;
}

.text-content {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.text-block.mobile-layout {
  padding: 10px;
}

.text-block.mobile-layout .text-title {
  font-size: 14px;
}

.text-block.mobile-layout .text-content {
  font-size: 11px;
}
</style>
