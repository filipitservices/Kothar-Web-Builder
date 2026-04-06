<template>
  <div class="location-input" ref="containerRef">
    <div class="location-input__field-wrap">
      <div class="location-input__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        class="location-input__field"
        :class="{ 'location-input__field--verified': modelValue.verified }"
        :placeholder="placeholder"
        :value="modelValue.displayName"
        :readonly="readOnly"
        :disabled="readOnly"
        autocomplete="off"
        role="combobox"
        :aria-expanded="showSuggestions"
        aria-autocomplete="list"
        :aria-controls="listId"
        :aria-activedescendant="activeDescendantId"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <span v-if="modelValue.verified" class="location-input__verified" aria-label="Location verified">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </span>
    </div>

    <Transition name="location-dropdown">
      <ul
        v-if="showSuggestions && suggestions.length > 0"
        :id="listId"
        class="location-input__suggestions"
        role="listbox"
      >
        <li
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.lat}-${suggestion.lon}-${index}`"
          :id="`${listId}-opt-${index}`"
          class="location-input__suggestion"
          :class="{ 'location-input__suggestion--active': highlightIndex === index }"
          role="option"
          :aria-selected="highlightIndex === index"
          @mousedown.prevent="selectSuggestion(suggestion)"
          @mouseenter="highlightIndex = index"
        >
          <span class="location-input__suggestion-name">{{ suggestion.displayName }}</span>
          <span v-if="suggestion.postcode" class="location-input__suggestion-detail">
            {{ suggestion.postcode }}
          </span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import type { LocationData } from '~/types/templateRequest';
import { usePhotonSearch, type PhotonSuggestion } from '~/composables/usePhotonSearch';

const props = withDefaults(
  defineProps<{
    modelValue: LocationData;
    inputId?: string;
    placeholder?: string;
    readOnly?: boolean;
  }>(),
  {
    inputId: 'location',
    placeholder: 'e.g., Austin, TX',
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: LocationData): void;
  (e: 'blur'): void;
}>();

const { results, search, clear } = usePhotonSearch();

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const highlightIndex = ref(-1);

const uid = Math.random().toString(36).slice(2, 9);
const listId = `location-list-${uid}`;

const suggestions = computed(() => results.value);
const showSuggestions = computed(() => isFocused.value && suggestions.value.length > 0);

const activeDescendantId = computed(() =>
  highlightIndex.value >= 0 ? `${listId}-opt-${highlightIndex.value}` : undefined
);

function onInput(event: Event): void {
  if (props.readOnly) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const text = target.value;

  emit('update:modelValue', {
    displayName: text,
    verified: false
  });

  search(text);
  highlightIndex.value = -1;
}

function selectSuggestion(suggestion: PhotonSuggestion): void {
  emit('update:modelValue', {
    displayName: suggestion.displayName,
    city: suggestion.city,
    state: suggestion.state,
    country: suggestion.country,
    postcode: suggestion.postcode,
    lat: suggestion.lat,
    lon: suggestion.lon,
    verified: true
  });
  clear();
  highlightIndex.value = -1;
}

function onFocus(): void {
  isFocused.value = true;
  if (props.modelValue.displayName.trim().length >= 2) {
    search(props.modelValue.displayName);
  }
}

function onBlur(): void {
  setTimeout(() => {
    isFocused.value = false;
    highlightIndex.value = -1;
    clear();
  }, 150);
  emit('blur');
}

function onKeydown(event: KeyboardEvent): void {
  if (!showSuggestions.value) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightIndex.value = Math.min(highlightIndex.value + 1, suggestions.value.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlightIndex.value = Math.max(highlightIndex.value - 1, 0);
      break;
    case 'Enter':
      event.preventDefault();
      if (highlightIndex.value >= 0 && highlightIndex.value < suggestions.value.length) {
        selectSuggestion(suggestions.value[highlightIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      clear();
      highlightIndex.value = -1;
      isFocused.value = false;
      inputRef.value?.blur();
      break;
  }
}

watch(suggestions, () => {
  highlightIndex.value = -1;
});

onBeforeUnmount(() => {
  clear();
});
</script>

<style scoped>
.location-input {
  position: relative;
}

.location-input__field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.location-input__icon {
  position: absolute;
  left: var(--space-md);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--color-text-muted);
}

.location-input__icon svg {
  width: 1rem;
  height: 1rem;
}

.location-input__field {
  width: 100%;
  padding: 0.75rem var(--space-md) 0.75rem 2.5rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: inherit;
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.location-input__field::placeholder {
  color: var(--color-placeholder);
}

.location-input__field:hover {
  border-color: var(--color-border-hover);
}

.location-input__field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-primary);
}

.location-input__field--verified {
  padding-right: 2.5rem;
}

.location-input__verified {
  position: absolute;
  right: var(--space-md);
  display: flex;
  align-items: center;
  color: var(--color-success);
}

.location-input__suggestions {
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
  max-height: 240px;
  overflow-y: auto;
}

.location-input__suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.location-input__suggestion:hover,
.location-input__suggestion--active {
  background: var(--color-bg-muted);
}

.location-input__suggestion-name {
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.4;
  min-width: 0;
  flex: 1;
}

.location-input__suggestion-detail {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Transition */
.location-dropdown-enter-active,
.location-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.location-dropdown-enter-from,
.location-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
