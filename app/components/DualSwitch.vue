<template>
  <div class="dual-switch-container">
    <button
      class="dual-switch"
      :class="{ 'switch-right': modelValue, compact }"
      :disabled="disabled"
      @click="$emit('update:modelValue', !modelValue)"
      :aria-pressed="!modelValue"
      role="switch"
      :title="title"
    >
      <span class="dual-label left" :class="{ active: !modelValue }">{{ leftLabel }}</span>
      <span class="dual-thumb"></span>
      <span class="dual-label right" :class="{ active: modelValue }">{{ rightLabel }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  leftLabel: {
    type: String,
    required: true
  },
  rightLabel: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.dual-switch-container {
  display: inline-flex;
  align-items: center;
}

.dual-switch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  background: #eef1f6;
  border: 1px solid #d7dde8;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  min-height: 40px;
  gap: 0;
}

.dual-switch.compact {
  min-height: 36px;
  padding: 3px;
}

.dual-switch:hover:not(:disabled) {
  background: #e8ecf3;
}

.dual-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dual-switch:focus-visible {
  outline: 2px solid #1e3a8a;
  outline-offset: 2px;
}

.dual-label {
  position: relative;
  z-index: 1;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  flex: 0 0 auto;
}

.dual-switch.compact .dual-label {
  padding: 5px 10px;
  font-size: 11px;
}

.dual-label.active {
  color: #ffffff;
}

.dual-thumb {
  position: absolute;
  left: 4px;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: #1e3a8a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.35);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 0;
}

.dual-switch.compact .dual-thumb {
  border-radius: 7px;
}

.dual-switch.switch-right .dual-thumb {
  transform: translateX(calc(100% + 4px));
}

.dual-switch:active:not(:disabled) .dual-thumb {
  box-shadow: 0 2px 12px rgba(30, 58, 138, 0.5);
}
</style>
