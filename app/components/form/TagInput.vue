<template>
  <div class="tag-input" ref="containerRef">
    <div class="tag-input__tags" v-if="modelValue.length > 0">
      <span
        v-for="(tag, index) in modelValue"
        :key="`${tag}-${index}`"
        class="tag-input__chip"
      >
        <span class="tag-input__chip-text">{{ tag }}</span>
        <button
          v-if="!readOnly"
          type="button"
          class="tag-input__chip-remove"
          :aria-label="`Remove ${tag}`"
          @click="removeTag(index)"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </span>
    </div>

    <div class="tag-input__field-wrap">
      <input
        ref="inputRef"
        type="text"
        class="tag-input__field"
        :placeholder="currentPlaceholder"
        :value="inputValue"
        :readonly="readOnly"
        :disabled="readOnly"
        autocomplete="off"
        role="combobox"
        :aria-expanded="showSuggestions"
        aria-autocomplete="list"
        @input="onInput"
        @keydown="onKeydown"
        @focus="isFocused = true"
        @blur="onBlur"
      />
    </div>

    <Transition name="tag-dropdown">
      <ul
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="tag-input__suggestions"
        role="listbox"
      >
        <li
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion"
          class="tag-input__suggestion"
          :class="{ 'tag-input__suggestion--active': highlightIndex === index }"
          role="option"
          :aria-selected="highlightIndex === index"
          @mousedown.prevent="addSuggestion(suggestion)"
          @mouseenter="highlightIndex = index"
        >
          {{ suggestion }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    suggestions?: readonly string[];
    placeholder?: string;
    maxTags?: number;
    readOnly?: boolean;
  }>(),
  {
    suggestions: () => [],
    placeholder: 'Type and press Enter to add...',
    maxTags: undefined,
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const inputValue = ref('');
const isFocused = ref(false);
const highlightIndex = ref(-1);

const atLimit = computed(() =>
  props.maxTags !== undefined && props.modelValue.length >= props.maxTags
);

const currentPlaceholder = computed(() => {
  if (atLimit.value) return `Maximum of ${props.maxTags} reached`;
  return props.modelValue.length > 0 ? 'Add another...' : props.placeholder;
});

const filteredSuggestions = computed(() => {
  const query = inputValue.value.trim().toLowerCase();
  const existing = new Set(props.modelValue.map((t) => t.toLowerCase()));
  return props.suggestions
    .filter((s) => !existing.has(s.toLowerCase()))
    .filter((s) => query === '' || s.toLowerCase().includes(query));
});

const showSuggestions = computed(() =>
  isFocused.value && !atLimit.value && filteredSuggestions.value.length > 0
);

function addTag(tag: string): void {
  const trimmed = tag.trim();
  if (trimmed === '' || atLimit.value) return;
  const exists = props.modelValue.some(
    (t) => t.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return;
  emit('update:modelValue', [...props.modelValue, trimmed]);
  inputValue.value = '';
  highlightIndex.value = -1;
}

function addSuggestion(suggestion: string): void {
  addTag(suggestion);
}

function removeTag(index: number): void {
  if (props.readOnly) return;
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}

function onInput(event: Event): void {
  if (props.readOnly || atLimit.value) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const value = target.value;

  if (value.includes(',')) {
    const parts = value.split(',');
    for (const part of parts) {
      if (part.trim()) addTag(part);
    }
    inputValue.value = '';
    return;
  }

  inputValue.value = value;
  highlightIndex.value = -1;
}

function onKeydown(event: KeyboardEvent): void {
  if (props.readOnly) return;

  if (event.key === 'Enter') {
    event.preventDefault();
    if (highlightIndex.value >= 0 && highlightIndex.value < filteredSuggestions.value.length) {
      addSuggestion(filteredSuggestions.value[highlightIndex.value]);
    } else if (inputValue.value.trim()) {
      addTag(inputValue.value);
    }
    return;
  }

  if (event.key === 'Backspace' && inputValue.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1);
    return;
  }

  if (showSuggestions.value) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightIndex.value = Math.min(
        highlightIndex.value + 1,
        filteredSuggestions.value.length - 1
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightIndex.value = Math.max(highlightIndex.value - 1, 0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      isFocused.value = false;
      inputRef.value?.blur();
    }
  }
}

function onBlur(): void {
  setTimeout(() => {
    isFocused.value = false;
    if (inputValue.value.trim()) {
      addTag(inputValue.value);
    }
    highlightIndex.value = -1;
  }, 150);
}
</script>

<style scoped>
.tag-input {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.tag-input__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag-input__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: var(--color-primary-tint);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-primary);
  line-height: 1.4;
}

.tag-input__chip-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-input__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--color-primary);
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.1s ease, background-color 0.1s ease;
}

.tag-input__chip-remove:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.tag-input__field-wrap {
  display: flex;
}

.tag-input__field {
  width: 100%;
  padding: 0.625rem var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.tag-input__field::placeholder {
  color: var(--color-placeholder);
}

.tag-input__field:hover {
  border-color: var(--color-border-hover);
}

.tag-input__field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-primary);
}

.tag-input__suggestions {
  position: absolute;
  z-index: 50;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-xs);
  padding: var(--space-xs) 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
}

.tag-input__suggestion {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
  color: var(--color-text-muted-dark);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.tag-input__suggestion:hover,
.tag-input__suggestion--active {
  background: var(--color-bg-muted);
  color: var(--color-text);
}

/* Transition */
.tag-dropdown-enter-active,
.tag-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tag-dropdown-enter-from,
.tag-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
