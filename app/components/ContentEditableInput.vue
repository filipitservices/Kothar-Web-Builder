<template>
  <div
    ref="editableRef"
    class="content-editable"
    :class="{ 'has-custom-value': hasCustomValue }"
    :contenteditable="!disabled"
    @blur="handleBlur"
    @keydown.enter.prevent="handleEnter"
    @input="handleInput"
    v-html="displayValue"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

interface Props {
  modelValue: string;
  hasCustomValue?: boolean;
  disabled?: boolean;
  multiline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasCustomValue: false,
  disabled: false,
  multiline: false
});

interface Emits {
  'update:modelValue': [value: string];
}

const emit = defineEmits<Emits>();

const editableRef = ref<HTMLDivElement | null>(null);
const displayValue = computed(() => props.modelValue);

// Handle input events for real-time updates (optional)
const handleInput = () => {
  if (!editableRef.value) return;
  const newValue = editableRef.value.textContent?.trim() || '';
  emit('update:modelValue', newValue);
};

// Handle blur to save changes
const handleBlur = () => {
  if (!editableRef.value) return;
  const newValue = editableRef.value.textContent?.trim() || '';
  
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
};

// Handle Enter key
const handleEnter = () => {
  if (props.multiline) return;
  editableRef.value?.blur();
};

// Sync content when modelValue changes externally
watch(() => props.modelValue, async (newValue) => {
  await nextTick();
  if (editableRef.value && editableRef.value.textContent !== newValue) {
    editableRef.value.textContent = newValue;
  }
});
</script>

<style scoped>
.content-editable {
  cursor: text;
  outline: none;
  min-height: 1em;
}

.content-editable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 2px;
}

.content-editable:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
}

.has-custom-value {
  font-weight: 600;
}
</style>
