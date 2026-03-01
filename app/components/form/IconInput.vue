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
  color: #9ca3af;
  transition: color 0.15s ease;
}

.icon-input__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.icon-input:focus-within .icon-input__icon {
  color: #1e3a8a;
}

.icon-input__field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #111827;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.icon-input__field::placeholder {
  color: #9ca3af;
}

.icon-input__field:hover {
  border-color: #d1d5db;
}

.icon-input__field:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.08);
}
</style>
