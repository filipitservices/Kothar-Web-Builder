<template>
  <div class="icon-input">
    <span class="icon-input__icon">
      <slot name="icon" />
    </span>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      class="icon-input__field"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  modelValue: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false
});

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur'): void;
}>();
</script>

<style scoped>
.icon-input {
  position: relative;
}

.icon-input__icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: var(--color-placeholder);
  transition: color 0.2s ease;
}

.icon-input__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.icon-input:focus-within .icon-input__icon {
  color: var(--color-primary);
}

.icon-input__field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: inherit;
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.icon-input__field::placeholder {
  color: var(--color-placeholder);
}

.icon-input__field:hover {
  border-color: var(--color-border-hover);
}

.icon-input__field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-primary);
}
</style>
